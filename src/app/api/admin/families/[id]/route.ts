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
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.order !== undefined) updateData.order = body.order;

  const family = await prisma.family.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(family);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;

  const family = await prisma.family.findUnique({
    where: { id },
    select: { _count: { select: { products: true, subfamilies: true } } },
  });

  if (!family) {
    return NextResponse.json({ error: "Famille non trouvee." }, { status: 404 });
  }

  if (family._count.products > 0 || family._count.subfamilies > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer: des produits ou sous-familles y sont rattaches." },
      { status: 400 }
    );
  }

  await prisma.family.delete({ where: { id } });
  return NextResponse.json({ message: "Famille supprimee." });
}
