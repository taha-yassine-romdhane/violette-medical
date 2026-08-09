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

  const subfamily = await prisma.subfamily.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(subfamily);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;

  const subfamily = await prisma.subfamily.findUnique({
    where: { id },
    select: { _count: { select: { products: true } } },
  });

  if (!subfamily) {
    return NextResponse.json({ error: "Sous-famille non trouvee." }, { status: 404 });
  }

  if (subfamily._count.products > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer: des produits y sont rattaches." },
      { status: 400 }
    );
  }

  await prisma.subfamily.delete({ where: { id } });
  return NextResponse.json({ message: "Sous-famille supprimee." });
}
