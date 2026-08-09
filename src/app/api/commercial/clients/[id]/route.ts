import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, hashPassword, isValidPassword } from "@/lib/auth-utils";

// GET /api/commercial/clients/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, session } = await requireRole("COMMERCIAL", "ADMIN");
  if (!authorized) return response;

  const { id } = await params;

  const client = await prisma.user.findUnique({
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
      isActive: true,
      createdById: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client non trouvé." }, { status: 404 });
  }

  // Commercials can only see their own clients
  if (session!.user.role === "COMMERCIAL" && client.createdById !== session!.user.id) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  return NextResponse.json(client);
}

// PATCH /api/commercial/clients/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response, session } = await requireRole("COMMERCIAL", "ADMIN");
  if (!authorized) return response;

  const { id } = await params;

  // Verify ownership
  const client = await prisma.user.findUnique({
    where: { id },
    select: { createdById: true },
  });

  if (!client) {
    return NextResponse.json({ error: "Client non trouvé." }, { status: 404 });
  }

  if (session!.user.role === "COMMERCIAL" && client.createdById !== session!.user.id) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body = await request.json();
  const { name, companyName, phone, address, city, postalCode, isActive, password } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (companyName !== undefined) updateData.companyName = companyName;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (city !== undefined) updateData.city = city;
  if (postalCode !== undefined) updateData.postalCode = postalCode;
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

  const updated = await prisma.user.update({
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

  return NextResponse.json(updated);
}
