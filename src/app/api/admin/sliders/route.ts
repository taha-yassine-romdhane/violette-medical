import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const sliders = await prisma.slider.findMany({
    orderBy: { order: "asc" },
  });

  return NextResponse.json(sliders);
}

export async function POST(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const {
    titleFr, titleEn, subtitleFr, subtitleEn,
    image, link, buttonTextFr, buttonTextEn, isActive = true,
  } = body;

  if (!image) {
    return NextResponse.json({ error: "Image requise." }, { status: 400 });
  }

  const maxOrder = await prisma.slider.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? -1) + 1;

  const slider = await prisma.slider.create({
    data: {
      titleFr, titleEn, subtitleFr, subtitleEn,
      image, link, buttonTextFr, buttonTextEn, order, isActive,
    },
  });

  return NextResponse.json(slider, { status: 201 });
}
