import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, hashPassword, isValidPassword } from "@/lib/auth-utils";

// GET /api/admin/users - List users with optional role filter
export async function GET(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { searchParams } = new URL(request.url);
  const roleFilter = searchParams.get("role");

  const where: Record<string, unknown> = {};
  const rolesParam = searchParams.get("roles");
  if (roleFilter && ["ADMIN", "COMMERCIAL", "USER"].includes(roleFilter)) {
    where.role = roleFilter;
  } else if (rolesParam) {
    const validRoles = rolesParam.split(",").filter((r) => ["ADMIN", "COMMERCIAL", "USER"].includes(r));
    if (validRoles.length > 0) where.role = { in: validRoles };
  }

  const searchQuery = searchParams.get("search");
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyName: true,
      phone: true,
      address: true,
      city: true,
      postalCode: true,
      matriculeFiscale: true,
      isActive: true,
      createdAt: true,
      _count: { select: { createdUsers: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

// POST /api/admin/users - Create an admin or commercial
export async function POST(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const { email, password, name, companyName, phone, role } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Email, mot de passe et nom sont requis." },
      { status: 400 }
    );
  }

  const allowedRoles = ["ADMIN", "COMMERCIAL", "USER"];
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Role invalide. Choisissez Admin, Commercial ou Client." },
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

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      companyName,
      phone,
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

  return NextResponse.json(user, { status: 201 });
}
