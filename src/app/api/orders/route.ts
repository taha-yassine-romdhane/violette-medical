import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// POST: create order from cart
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
          pack: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Panier vide." }, { status: 400 });
  }

  // Build order items
  const orderItems = cart.items.map((item) => {
    const entity = item.product || item.pack;
    if (!entity) throw new Error("Item sans produit ni pack");

    return {
      productId: item.productId,
      packId: item.packId,
      quantity: item.quantity,
      nameFr: entity.nameFr,
      nameEn: entity.nameEn,
      priceHT: entity.priceHT,
      taxRate: entity.taxRate,
      priceTTC: entity.priceTTC,
    };
  });

  const totalHT = orderItems.reduce((sum, i) => sum + i.priceHT * i.quantity, 0);
  const totalTTC = orderItems.reduce((sum, i) => sum + i.priceTTC * i.quantity, 0);
  const totalTax = totalTTC - totalHT;

  // Generate order number: VIO-YYYYMMDD-XXXX
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      },
    },
  });
  const orderNumber = `VIO-${dateStr}-${String(count + 1).padStart(4, "0")}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.user.id,
      totalHT: Math.round(totalHT * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalTTC: Math.round(totalTTC * 100) / 100,
      status: "PENDING",
      items: { create: orderItems },
      steps: { create: { status: "PENDING", note: "Commande passee" } },
    },
  });

  // Clear cart
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json({ order, orderNumber: order.orderNumber }, { status: 201 });
}
