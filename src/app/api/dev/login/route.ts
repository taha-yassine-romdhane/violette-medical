import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

// DEV ONLY — provisions throwaway test accounts for each role so the
// floating dev bubble can switch roles instantly. Returns 404 in production.

const DEV_PASSWORD = "dev123456";

const DEV_USERS = {
  ADMIN: { email: "dev-admin@violette.dev", name: "Dev Admin" },
  COMMERCIAL: { email: "dev-commercial@violette.dev", name: "Dev Commercial" },
  USER: { email: "dev-client@violette.dev", name: "Dev Client" },
} as const;

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const { role } = await request.json();
  const entry = DEV_USERS[role as keyof typeof DEV_USERS];
  if (!entry) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(DEV_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: entry.email },
    update: { role: role, isActive: true, password: hashed },
    create: {
      email: entry.email,
      password: hashed,
      name: entry.name,
      role: role,
      companyName: "DEV — Compte de test",
      isActive: true,
    },
  });

  return NextResponse.json({ email: entry.email, password: DEV_PASSWORD });
}
