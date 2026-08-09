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
  const fields = [
    "titleFr", "titleEn", "subtitleFr", "subtitleEn",
    "image", "link", "buttonTextFr", "buttonTextEn", "order", "isActive",
  ];
  for (const f of fields) {
    if (body[f] !== undefined) updateData[f] = body[f];
  }

  const slider = await prisma.slider.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(slider);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  await prisma.slider.delete({ where: { id } });
  return NextResponse.json({ message: "Slide supprime." });
}
