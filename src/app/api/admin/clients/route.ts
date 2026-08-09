import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, hashPassword, isValidPassword } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { searchParams } = new URL(request.url);
  const commercialId = searchParams.get("commercial");
  const city = searchParams.get("city");
  const search = searchParams.get("search");
  const clientType = searchParams.get("clientType");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { role: "USER" };
  if (commercialId) where.createdById = commercialId;
  if (city) where.city = city;
  if (clientType && ["RESPIRATORY", "DIABETIC", "BOTH"].includes(clientType)) where.clientType = clientType;
  if (status === "active") where.isActive = true;
  else if (status === "inactive") where.isActive = false;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { companyName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { matriculeFiscale: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const clients = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      matriculeFiscale: true,
      address: true,
      city: true,
      postalCode: true,
      phone: true,
      clientType: true,
      isActive: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const {
    email, password, name, companyName, matriculeFiscale,
    address, city, postalCode, phone, createdById, clientType,
  } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Email, mot de passe et nom requis." }, { status: 400 });
  }

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Mot de passe invalide (8+ car., maj, min, chiffre)." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Email deja utilise." }, { status: 409 });
  }

  const client = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: await hashPassword(password),
      name,
      role: "USER",
      companyName,
      matriculeFiscale,
      address,
      city,
      postalCode,
      phone,
      clientType: clientType && ["RESPIRATORY", "DIABETIC", "BOTH"].includes(clientType) ? clientType : undefined,
      createdById: createdById || undefined,
    },
    select: {
      id: true, email: true, name: true, companyName: true,
      city: true, phone: true, isActive: true, createdAt: true,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
