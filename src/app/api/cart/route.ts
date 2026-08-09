import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET: fetch current user's cart
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  let cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, nameFr: true, nameEn: true, slug: true, thumbnail: true, priceTTC: true, priceHT: true, stock: true, isActive: true } },
          pack: { select: { id: true, nameFr: true, nameEn: true, slug: true, image: true, priceTTC: true, priceHT: true, isActive: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, nameFr: true, nameEn: true, slug: true, thumbnail: true, priceTTC: true, priceHT: true, stock: true, isActive: true } },
            pack: { select: { id: true, nameFr: true, nameEn: true, slug: true, image: true, priceTTC: true, priceHT: true, isActive: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  const totalTTC = cart.items.reduce((sum, item) => {
    const price = item.product?.priceTTC || item.pack?.priceTTC || 0;
    return sum + price * item.quantity;
  }, 0);

  return NextResponse.json({
    cart: { ...cart, totalTTC: Math.round(totalTTC * 100) / 100 },
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
  });
}

// POST: add item to cart
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const body = await request.json();
  const { productId, packId, quantity = 1 } = body;

  if (!productId && !packId) {
    return NextResponse.json({ error: "Produit ou pack requis." }, { status: 400 });
  }
  if (quantity < 1 || quantity > 999) {
    return NextResponse.json({ error: "Quantite invalide." }, { status: 400 });
  }

  // Ensure cart exists
  let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: session.user.id } });
  }

  // Check if item already in cart
  if (productId) {
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }
  } else if (packId) {
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_packId: { cartId: cart.id, packId } },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, packId, quantity },
      });
    }
  }

  return NextResponse.json({ message: "Ajoute au panier." }, { status: 201 });
}
