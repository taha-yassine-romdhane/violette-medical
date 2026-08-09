import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { auth } from "@/auth";

async function getImportation(id: string) {
  return prisma.importation.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, nameFr: true, reference: true, thumbnail: true, trackSerial: true, stock: true },
          },
          units: { select: { id: true, serialNumber: true, status: true } },
        },
        orderBy: { id: "asc" },
      },
    },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const importation = await getImportation(id);
  if (!importation) {
    return NextResponse.json({ error: "Importation introuvable" }, { status: 404 });
  }
  return NextResponse.json(importation);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const body = await request.json();

  const importation = await prisma.importation.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { trackSerial: true, nameFr: true } } } } },
  });
  if (!importation) {
    return NextResponse.json({ error: "Importation introuvable" }, { status: 404 });
  }

  // ---- Receive: validate serials, create units, increment stock, log movements ----
  if (body.action === "receive") {
    if (importation.status === "RECEIVED") {
      return NextResponse.json({ error: "Importation déjà réceptionnée." }, { status: 400 });
    }
    if (importation.items.length === 0) {
      return NextResponse.json({ error: "Aucune ligne dans cette importation." }, { status: 400 });
    }

    // Validate serials
    const allSerials: string[] = [];
    for (const item of importation.items) {
      if (!item.product.trackSerial) continue;
      const serials = item.serialsDraft.map((sn) => sn.trim()).filter(Boolean);
      if (serials.length !== item.quantity) {
        return NextResponse.json(
          { error: `"${item.product.nameFr}" : ${serials.length} N° de série saisi(s) pour ${item.quantity} unité(s).` },
          { status: 400 }
        );
      }
      allSerials.push(...serials);
    }
    const dupes = allSerials.filter((sn, i) => allSerials.indexOf(sn) !== i);
    if (dupes.length > 0) {
      return NextResponse.json(
        { error: `N° de série en double dans l'importation : ${[...new Set(dupes)].join(", ")}` },
        { status: 400 }
      );
    }
    if (allSerials.length > 0) {
      const existing = await prisma.productUnit.findMany({
        where: { serialNumber: { in: allSerials } },
        select: { serialNumber: true },
      });
      if (existing.length > 0) {
        return NextResponse.json(
          { error: `N° de série déjà enregistré(s) : ${existing.map((e) => e.serialNumber).join(", ")}` },
          { status: 400 }
        );
      }
    }

    const session = await auth();
    const userId = session?.user?.id || null;

    await prisma.$transaction(async (tx) => {
      for (const item of importation.items) {
        // Create serialized units
        if (item.product.trackSerial) {
          await tx.productUnit.createMany({
            data: item.serialsDraft
              .map((sn) => sn.trim())
              .filter(Boolean)
              .map((sn) => ({
                serialNumber: sn,
                productId: item.productId,
                importationItemId: item.id,
              })),
          });
        }
        // Increment stock
        const updated = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
          select: { stock: true },
        });
        // Log movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "IMPORT",
            delta: item.quantity,
            stockAfter: updated.stock,
            reference: importation.reference,
            userId,
          },
        });
      }
      await tx.importation.update({ where: { id }, data: { status: "RECEIVED" } });
    });

    return NextResponse.json(await getImportation(id));
  }

  // ---- Draft updates (header fields and/or full item list) ----
  if (importation.status === "RECEIVED") {
    return NextResponse.json({ error: "Importation réceptionnée — modification impossible." }, { status: 400 });
  }

  const { supplier, invoiceNumber, arrivalDate, note, items } = body;

  await prisma.$transaction(async (tx) => {
    await tx.importation.update({
      where: { id },
      data: {
        ...(supplier !== undefined ? { supplier } : {}),
        ...(invoiceNumber !== undefined ? { invoiceNumber: invoiceNumber || null } : {}),
        ...(arrivalDate !== undefined ? { arrivalDate: new Date(arrivalDate) } : {}),
        ...(note !== undefined ? { note: note || null } : {}),
      },
    });

    if (Array.isArray(items)) {
      await tx.importationItem.deleteMany({ where: { importationId: id } });
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity < 1) continue;
        await tx.importationItem.create({
          data: {
            importationId: id,
            productId: item.productId,
            quantity: Math.floor(item.quantity),
            serialsDraft: Array.isArray(item.serials)
              ? item.serials.map((s: string) => String(s).trim()).filter(Boolean)
              : [],
          },
        });
      }
    }
  });

  return NextResponse.json(await getImportation(id));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const importation = await prisma.importation.findUnique({ where: { id } });
  if (!importation) {
    return NextResponse.json({ error: "Importation introuvable" }, { status: 404 });
  }
  if (importation.status === "RECEIVED") {
    return NextResponse.json({ error: "Impossible de supprimer une importation réceptionnée." }, { status: 400 });
  }
  await prisma.importation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
