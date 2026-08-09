import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const settings = await prisma.siteSetting.findMany({
    orderBy: { group: "asc" },
  });

  // Group by group name
  const grouped: Record<string, Record<string, string>> = {};
  for (const s of settings) {
    if (!grouped[s.group]) grouped[s.group] = {};
    grouped[s.group][s.key] = s.value;
  }

  return NextResponse.json(grouped);
}

export async function PUT(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json() as Record<string, Record<string, string>>;

  const upserts: Promise<unknown>[] = [];

  for (const [group, entries] of Object.entries(body)) {
    for (const [key, value] of Object.entries(entries)) {
      upserts.push(
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value, group },
          update: { value, group },
        })
      );
    }
  }

  await Promise.all(upserts);

  return NextResponse.json({ message: "Parametres mis a jour." });
}
