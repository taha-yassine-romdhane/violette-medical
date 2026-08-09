import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.nameFr !== undefined) updateData.nameFr = body.nameFr;
  if (body.nameEn !== undefined) updateData.nameEn = body.nameEn;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.image !== undefined) updateData.image = body.image;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(category);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    select: { _count: { select: { products: true, families: true } } },
  });

  if (!category) {
    return NextResponse.json({ error: "Categorie non trouvee." }, { status: 404 });
  }

  if (category._count.products > 0 || category._count.families > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer: des produits ou familles y sont rattaches." },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ message: "Categorie supprimee." });
}
