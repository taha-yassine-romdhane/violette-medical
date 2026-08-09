import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const products = await prisma.product.findMany({
    select: {
      id: true,
      nameFr: true,
      reference: true,
      stock: true,
      minStock: true,
      trackSerial: true,
      isActive: true,
      thumbnail: true,
      images: true,
      category: { select: { id: true, nameFr: true } },
    },
    orderBy: { nameFr: "asc" },
  });

  return NextResponse.json(products);
}
