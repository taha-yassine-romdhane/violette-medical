import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const importations = await prisma.importation.findMany({
    include: {
      items: { select: { quantity: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    importations.map((imp) => ({
      id: imp.id,
      reference: imp.reference,
      supplier: imp.supplier,
      invoiceNumber: imp.invoiceNumber,
      arrivalDate: imp.arrivalDate,
      status: imp.status,
      lineCount: imp._count.items,
      totalQuantity: imp.items.reduce((s, i) => s + i.quantity, 0),
      createdAt: imp.createdAt,
    }))
  );
}

export async function POST(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const { supplier, invoiceNumber, arrivalDate, note } = body;

  // Auto reference: IMP-YYYY-NNN
  const year = new Date().getFullYear();
  const count = await prisma.importation.count({
    where: { reference: { startsWith: `IMP-${year}-` } },
  });
  let reference = `IMP-${year}-${String(count + 1).padStart(3, "0")}`;
  // Guard against gaps/collisions
  while (await prisma.importation.findUnique({ where: { reference } })) {
    const n = parseInt(reference.split("-")[2], 10) + 1;
    reference = `IMP-${year}-${String(n).padStart(3, "0")}`;
  }

  const importation = await prisma.importation.create({
    data: {
      reference,
      supplier: supplier || "Yuwell",
      invoiceNumber: invoiceNumber || null,
      arrivalDate: arrivalDate ? new Date(arrivalDate) : new Date(),
      note: note || null,
    },
  });

  return NextResponse.json(importation, { status: 201 });
}
