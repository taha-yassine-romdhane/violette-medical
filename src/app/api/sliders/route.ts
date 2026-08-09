import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const sliders = await prisma.slider.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      titleFr: true,
      titleEn: true,
      subtitleFr: true,
      subtitleEn: true,
      image: true,
      link: true,
      buttonTextFr: true,
      buttonTextEn: true,
      order: true,
    },
  });

  return NextResponse.json(sliders);
}
