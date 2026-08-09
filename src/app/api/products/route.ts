import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");
  const familySlug = searchParams.get("family");
  const subfamilySlug = searchParams.get("subfamily");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 48);
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = { isActive: true };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (familySlug) {
    where.family = { slug: familySlug };
  }
  if (subfamilySlug) {
    where.subfamily = { slug: subfamilySlug };
  }
  if (featured === "true") {
    where.isFeatured = true;
  }
  if (search) {
    where.OR = [
      { nameFr: { contains: search, mode: "insensitive" } },
      { nameEn: { contains: search, mode: "insensitive" } },
      { reference: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        nameFr: true,
        nameEn: true,
        slug: true,
        reference: true,
        descriptionFr: true,
        descriptionEn: true,
        thumbnail: true,
        images: true,
        isFeatured: true,
        // Only include pricing/stock for authenticated users
        ...(isAuthenticated
          ? { priceHT: true, taxRate: true, priceTTC: true, stock: true }
          : {}),
        category: { select: { id: true, nameFr: true, nameEn: true, slug: true } },
        family: { select: { id: true, nameFr: true, nameEn: true, slug: true } },
        subfamily: { select: { id: true, nameFr: true, nameEn: true, slug: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    isAuthenticated,
  });
}
