import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function PATCH(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const { orderedIds } = body as { orderedIds: string[] };

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: "Liste d'IDs requise." }, { status: 400 });
  }

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.slider.update({ where: { id }, data: { order: index } })
    )
  );

  return NextResponse.json({ message: "Ordre mis a jour." });
}
