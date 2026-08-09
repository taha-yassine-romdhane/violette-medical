import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { auth } from "@/auth";

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const body = await request.json();
  const status = body.status as OrderStatus;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: { select: { productId: true, quantity: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  const session = await auth();
  const userId = session?.user?.id || null;

  // Stock semantics: stock leaves the shelf when the order is delivered,
  // and comes back if a delivered order is returned.
  const decrement = status === "DELIVERED" && existing.status !== "DELIVERED";
  const restore = existing.status === "DELIVERED" && status !== "DELIVERED";

  const order = await prisma.$transaction(async (tx) => {
    if (decrement || restore) {
      const sign = decrement ? -1 : 1;
      const type = decrement ? "SALE" : "RETURN";
      for (const item of existing.items) {
        if (!item.productId) continue;
        const updated = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: sign * item.quantity } },
          select: { stock: true },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type,
            delta: sign * item.quantity,
            stockAfter: updated.stock,
            reference: existing.orderNumber,
            userId,
          },
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { name: true, companyName: true, email: true } },
        _count: { select: { items: true } },
      },
    });
  });

  return NextResponse.json(order);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, companyName: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, nameFr: true, reference: true, thumbnail: true, trackSerial: true } },
          pack: { select: { nameFr: true } },
          units: { select: { id: true, serialNumber: true }, orderBy: { serialNumber: "asc" } },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }
  return NextResponse.json(order);
}
