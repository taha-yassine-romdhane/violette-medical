import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      nameFr: true,
      nameEn: true,
      slug: true,
      image: true,
      _count: { select: { products: true } },
      families: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          nameFr: true,
          nameEn: true,
          slug: true,
          _count: { select: { products: true } },
          subfamilies: {
            where: { isActive: true },
            orderBy: { order: "asc" },
            select: {
              id: true,
              nameFr: true,
              nameEn: true,
              slug: true,
              _count: { select: { products: true } },
            },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(categories);
}
