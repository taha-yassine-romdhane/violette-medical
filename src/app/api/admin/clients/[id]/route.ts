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
  const client = await prisma.user.findUnique({
    where: { id, role: "USER" },
    select: {
      id: true, email: true, name: true, companyName: true,
      matriculeFiscale: true, address: true, city: true,
      postalCode: true, phone: true, clientType: true, isActive: true, createdAt: true,
      createdBy: { select: { id: true, name: true } },
      _count: { select: { orders: true } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client non trouve." }, { status: 404 });
  }

  return NextResponse.json(client);
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
  const fields = ["name", "companyName", "matriculeFiscale", "address", "city", "postalCode", "phone", "clientType", "isActive", "createdById"];
  for (const f of fields) {
    if (body[f] !== undefined) updateData[f] = body[f];
  }

  const client = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true, email: true, name: true, companyName: true,
      city: true, phone: true, isActive: true,
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;

  const client = await prisma.user.findUnique({
    where: { id },
    select: { _count: { select: { orders: true } } },
  });

  if (!client) {
    return NextResponse.json({ error: "Client non trouve." }, { status: 404 });
  }

  if (client._count.orders > 0) {
    await prisma.user.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ message: "Client desactive (commandes existantes)." });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "Client supprime." });
}
