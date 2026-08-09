import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

// List units available for an order item (in stock, or already assigned to it).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id: orderId } = await params;
  const orderItemId = new URL(request.url).searchParams.get("orderItemId");
  if (!orderItemId) {
    return NextResponse.json({ error: "orderItemId requis." }, { status: 400 });
  }

  const orderItem = await prisma.orderItem.findFirst({
    where: { id: orderItemId, orderId },
    select: { productId: true },
  });
  if (!orderItem?.productId) {
    return NextResponse.json({ error: "Ligne de commande introuvable." }, { status: 404 });
  }

  const units = await prisma.productUnit.findMany({
    where: {
      productId: orderItem.productId,
      OR: [{ status: "IN_STOCK" }, { orderItemId }],
    },
    select: { id: true, serialNumber: true, orderItemId: true },
    orderBy: { serialNumber: "asc" },
  });

  return NextResponse.json({
    units: units.map((u) => ({ id: u.id, serialNumber: u.serialNumber, assigned: u.orderItemId === orderItemId })),
  });
}

// Assign serialized units to an order item (replace semantics).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id: orderId } = await params;
  const { orderItemId, unitIds } = await request.json();

  if (!orderItemId || !Array.isArray(unitIds)) {
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  }

  const orderItem = await prisma.orderItem.findFirst({
    where: { id: orderItemId, orderId },
    include: { product: { select: { id: true, trackSerial: true } } },
  });
  if (!orderItem) {
    return NextResponse.json({ error: "Ligne de commande introuvable." }, { status: 404 });
  }
  if (!orderItem.product?.trackSerial) {
    return NextResponse.json({ error: "Ce produit n'est pas suivi par N° de série." }, { status: 400 });
  }
  if (unitIds.length > orderItem.quantity) {
    return NextResponse.json(
      { error: `Maximum ${orderItem.quantity} N° de série pour cette ligne.` },
      { status: 400 }
    );
  }

  // Units must belong to this product and be available (or already on this line)
  const units = await prisma.productUnit.findMany({
    where: { id: { in: unitIds } },
    select: { id: true, productId: true, status: true, orderItemId: true },
  });
  if (units.length !== unitIds.length) {
    return NextResponse.json({ error: "Unité(s) introuvable(s)." }, { status: 400 });
  }
  for (const u of units) {
    if (u.productId !== orderItem.product.id) {
      return NextResponse.json({ error: "Une unité n'appartient pas à ce produit." }, { status: 400 });
    }
    const availableHere = u.status === "IN_STOCK" || u.orderItemId === orderItemId;
    if (!availableHere) {
      return NextResponse.json({ error: "Une unité n'est plus disponible." }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    // Release units currently on this line that are not in the new set
    await tx.productUnit.updateMany({
      where: { orderItemId, id: { notIn: unitIds } },
      data: { orderItemId: null, status: "IN_STOCK", soldAt: null },
    });
    // Assign the new set
    await tx.productUnit.updateMany({
      where: { id: { in: unitIds } },
      data: { orderItemId, status: "SOLD", soldAt: new Date() },
    });
  });

  const assigned = await prisma.productUnit.findMany({
    where: { orderItemId },
    select: { id: true, serialNumber: true },
    orderBy: { serialNumber: "asc" },
  });
  return NextResponse.json({ assigned });
}
