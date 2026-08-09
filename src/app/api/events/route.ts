import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

// GET: Public returns active events; admin (?all=true) returns all events
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  let where: { isActive?: boolean } = { isActive: true };

  if (all) {
    const { authorized } = await requireRole("ADMIN");
    if (authorized) {
      where = {};
    }
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(events);
}

// POST: Admin only - creates a new event
export async function POST(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const {
    titleFr, titleEn, descriptionFr, descriptionEn,
    location, date, endDate, images, thumbnail,
    isActive = true, isFeatured = false, order,
  } = body;

  if (!titleFr || !date) {
    return NextResponse.json(
      { error: "Le titre (FR) et la date sont requis." },
      { status: 400 }
    );
  }

  const event = await prisma.event.create({
    data: {
      titleFr,
      titleEn,
      descriptionFr,
      descriptionEn,
      location,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      images: images ?? [],
      thumbnail,
      isActive,
      isFeatured,
      order: order ?? 0,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
