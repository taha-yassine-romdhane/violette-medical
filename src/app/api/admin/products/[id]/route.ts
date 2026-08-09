import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, nameFr: true } },
      family: { select: { id: true, nameFr: true } },
      subfamily: { select: { id: true, nameFr: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Produit non trouve." }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  const fields = [
    "nameFr", "nameEn", "reference", "descriptionFr", "descriptionEn",
    "priceHT", "taxRate", "stock", "minStock", "images", "thumbnail",
    "categoryId", "familyId", "subfamilyId", "isFeatured", "isActive", "trackSerial",
  ];

  for (const f of fields) {
    if (body[f] !== undefined) updateData[f] = body[f];
  }

  // Recalculate priceTTC if price or tax changed
  if (updateData.priceHT !== undefined || updateData.taxRate !== undefined) {
    const current = await prisma.product.findUnique({ where: { id }, select: { priceHT: true, taxRate: true } });
    if (current) {
      const ht = (updateData.priceHT as number) ?? current.priceHT;
      const tax = (updateData.taxRate as number) ?? current.taxRate;
      updateData.priceTTC = Math.round(ht * (1 + tax / 100) * 100) / 100;
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { id: true, nameFr: true } },
      family: { select: { id: true, nameFr: true } },
      subfamily: { select: { id: true, nameFr: true } },
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { _count: { select: { orderItems: true } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Produit non trouve." }, { status: 404 });
  }

  if (product._count.orderItems > 0) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ message: "Produit desactive (commandes existantes)." });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ message: "Produit supprime." });
}
