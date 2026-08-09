import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = categoryId;

  const families = await prisma.family.findMany({
    where,
    include: {
      _count: { select: { products: true, subfamilies: true } },
      category: { select: { id: true, nameFr: true } },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(families);
}

export async function POST(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const { nameFr, nameEn, categoryId } = body;

  if (!nameFr || !nameEn || !categoryId) {
    return NextResponse.json({ error: "Noms FR/EN et categorie requis." }, { status: 400 });
  }

  const slug = nameFr
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Date.now().toString(36);

  const family = await prisma.family.create({
    data: { nameFr, nameEn, slug, categoryId },
  });

  return NextResponse.json(family, { status: 201 });
}
