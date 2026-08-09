import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { searchParams } = new URL(request.url);
  const familyId = searchParams.get("familyId");

  const where: Record<string, unknown> = {};
  if (familyId) where.familyId = familyId;

  const subfamilies = await prisma.subfamily.findMany({
    where,
    include: {
      _count: { select: { products: true } },
      family: { select: { id: true, nameFr: true, categoryId: true } },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(subfamilies);
}

export async function POST(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const { nameFr, nameEn, familyId } = body;

  if (!nameFr || !nameEn || !familyId) {
    return NextResponse.json({ error: "Noms FR/EN et famille requis." }, { status: 400 });
  }

  const slug = nameFr
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Date.now().toString(36);

  const subfamily = await prisma.subfamily.create({
    data: { nameFr, nameEn, slug, familyId },
  });

  return NextResponse.json(subfamily, { status: 201 });
}
