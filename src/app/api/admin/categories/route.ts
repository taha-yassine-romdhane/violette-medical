import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true, families: true } },
      families: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { products: true, subfamilies: true } },
          subfamilies: {
            orderBy: { order: "asc" },
            include: { _count: { select: { products: true } } },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const { nameFr, nameEn, description, image } = body;

  if (!nameFr || !nameEn) {
    return NextResponse.json({ error: "Noms FR et EN requis." }, { status: 400 });
  }

  const slug = nameFr
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Date.now().toString(36);

  const category = await prisma.category.create({
    data: { nameFr, nameEn, slug, description, image },
  });

  return NextResponse.json(category, { status: 201 });
}
