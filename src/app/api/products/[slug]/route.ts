import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const role = session?.user?.role;
  const canSeePrices = role === "ADMIN" || role === "COMMERCIAL";
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      nameFr: true,
      nameEn: true,
      slug: true,
      reference: true,
      descriptionFr: true,
      descriptionEn: true,
      images: true,
      thumbnail: true,
      isFeatured: true,
      ...(canSeePrices
        ? { priceHT: true, taxRate: true, priceTTC: true, stock: true, minStock: true }
        : {}),
      category: { select: { id: true, nameFr: true, nameEn: true, slug: true } },
      family: { select: { id: true, nameFr: true, nameEn: true, slug: true } },
      subfamily: { select: { id: true, nameFr: true, nameEn: true, slug: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Produit non trouve." }, { status: 404 });
  }

  // Get related products from same category/family
  const relatedWhere: Record<string, unknown> = {
    isActive: true,
    id: { not: product.id },
  };
  if (product.subfamily) {
    relatedWhere.subfamilyId = product.subfamily.id;
  } else if (product.family) {
    relatedWhere.familyId = product.family.id;
  } else {
    relatedWhere.categoryId = product.category.id;
  }

  const related = await prisma.product.findMany({
    where: relatedWhere,
    select: {
      id: true,
      nameFr: true,
      nameEn: true,
      slug: true,
      thumbnail: true,
      ...(canSeePrices ? { priceTTC: true } : {}),
      category: { select: { nameFr: true, nameEn: true, slug: true } },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ product, related, isAuthenticated, canSeePrices });
}
