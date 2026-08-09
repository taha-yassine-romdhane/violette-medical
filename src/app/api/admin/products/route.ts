import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (category) where.categoryId = category;
  if (search) {
    where.OR = [
      { nameFr: { contains: search, mode: "insensitive" } },
      { nameEn: { contains: search, mode: "insensitive" } },
      { reference: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, nameFr: true } },
      family: { select: { id: true, nameFr: true } },
      subfamily: { select: { id: true, nameFr: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const {
    nameFr, nameEn, reference, descriptionFr, descriptionEn,
    priceHT, taxRate = 19, categoryId, stock = 0, minStock = 0,
    images = [], thumbnail, isFeatured = false, isActive = true,
    familyId, subfamilyId, trackSerial = true,
  } = body;

  if (!nameFr || !nameEn || !priceHT || !categoryId) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }

  const slug = nameFr
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Date.now().toString(36);

  const priceTTC = priceHT * (1 + taxRate / 100);

  const product = await prisma.product.create({
    data: {
      nameFr, nameEn, slug, reference, descriptionFr, descriptionEn,
      priceHT, taxRate, priceTTC: Math.round(priceTTC * 100) / 100,
      stock, minStock, images, thumbnail, categoryId,
      familyId: familyId || null, subfamilyId: subfamilyId || null,
      isFeatured, isActive, trackSerial,
    },
    include: {
      category: { select: { id: true, nameFr: true } },
      family: { select: { id: true, nameFr: true } },
      subfamily: { select: { id: true, nameFr: true } },
    },
  });

  return NextResponse.json(product, { status: 201 });
}
