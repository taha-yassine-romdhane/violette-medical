import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// PATCH: update quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const { itemId } = await params;
  const body = await request.json();
  const { quantity } = body;

  if (!quantity || quantity < 1 || quantity > 999) {
    return NextResponse.json({ error: "Quantite invalide." }, { status: 400 });
  }

  // Verify ownership
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: { select: { userId: true } } },
  });

  if (!item || item.cart.userId !== session.user.id) {
    return NextResponse.json({ error: "Article non trouve." }, { status: 404 });
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return NextResponse.json({ message: "Quantite mise a jour." });
}

// DELETE: remove item from cart
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const { itemId } = await params;

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: { select: { userId: true } } },
  });

  if (!item || item.cart.userId !== session.user.id) {
    return NextResponse.json({ error: "Article non trouve." }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return NextResponse.json({ message: "Article supprime." });
}
