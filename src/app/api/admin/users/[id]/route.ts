import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, hashPassword, isValidPassword } from "@/lib/auth-utils";

// GET /api/admin/users/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
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
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { createdUsers: true, orders: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH /api/admin/users/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const body = await request.json();
  const { name, email, companyName, phone, address, city, postalCode, matriculeFiscale, role, isActive, password } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email.toLowerCase();
  if (companyName !== undefined) updateData.companyName = companyName;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (city !== undefined) updateData.city = city;
  if (postalCode !== undefined) updateData.postalCode = postalCode;
  if (matriculeFiscale !== undefined) updateData.matriculeFiscale = matriculeFiscale || null;
  if (role !== undefined && ["ADMIN", "COMMERCIAL", "USER"].includes(role)) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;

  if (password) {
    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.",
        },
        { status: 400 }
      );
    }
    updateData.password = await hashPassword(password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      phone: true,
      isActive: true,
    },
  });

  return NextResponse.json(user);
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;

  // Check if user has orders before deleting
  const user = await prisma.user.findUnique({
    where: { id },
    select: { _count: { select: { orders: true } } },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
  }

  if (user._count.orders > 0) {
    // Deactivate instead of delete if there are orders
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ message: "Utilisateur désactivé (commandes existantes)." });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "Utilisateur supprimé." });
}
