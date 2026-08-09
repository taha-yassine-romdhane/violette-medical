import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, hashPassword, isValidPassword } from "@/lib/auth-utils";

// GET /api/commercial/clients - List clients created by this commercial
export async function GET() {
  const { authorized, response, session } = await requireRole("COMMERCIAL", "ADMIN");
  if (!authorized) return response;

  const where =
    session!.user.role === "ADMIN"
      ? { role: "USER" as const }
      : { role: "USER" as const, createdById: session!.user.id };

  const clients = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      matriculeFiscale: true,
      phone: true,
      city: true,
      isActive: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

// POST /api/commercial/clients - Create a client
export async function POST(request: NextRequest) {
  const { authorized, response, session } = await requireRole("COMMERCIAL", "ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const {
    email,
    password,
    name,
    companyName,
    matriculeFiscale,
    address,
    city,
    postalCode,
    phone,
  } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Email, mot de passe et nom sont requis." },
      { status: 400 }
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      {
        error:
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.",
      },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Un utilisateur avec cet email existe déjà." },
      { status: 409 }
    );
  }

  if (matriculeFiscale) {
    const existingMF = await prisma.user.findUnique({
      where: { matriculeFiscale },
    });
    if (existingMF) {
      return NextResponse.json(
        { error: "Ce matricule fiscale est déjà utilisé." },
        { status: 409 }
      );
    }
  }

  const hashedPassword = await hashPassword(password);

  const client = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: "USER",
      companyName,
      matriculeFiscale: matriculeFiscale || null,
      address,
      city,
      postalCode,
      phone,
      createdById: session!.user.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
