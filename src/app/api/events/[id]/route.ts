import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

// GET: Public - returns single event by id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Evenement introuvable." },
      { status: 404 }
    );
  }

  return NextResponse.json(event);
}

// PATCH: Admin only - updates event fields
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
    "titleFr", "titleEn", "descriptionFr", "descriptionEn",
    "location", "images", "thumbnail", "isActive", "isFeatured", "order",
  ];
  for (const f of fields) {
    if (body[f] !== undefined) updateData[f] = body[f];
  }

  // Handle date fields separately for proper conversion
  if (body.date !== undefined) updateData.date = new Date(body.date);
  if (body.endDate !== undefined) {
    updateData.endDate = body.endDate ? new Date(body.endDate) : null;
  }

  const event = await prisma.event.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(event);
}

// DELETE: Admin only - deletes event
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ message: "Evenement supprime." });
}
