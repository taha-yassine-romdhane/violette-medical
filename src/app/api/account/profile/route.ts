import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hashPassword, isValidPassword, validatePassword } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, companyName: true,
      matriculeFiscale: true, address: true, city: true,
      postalCode: true, phone: true, role: true, createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  // Users can edit: company info, contact info, address
  const editableFields = ["companyName", "phone", "address", "city", "postalCode"];
  for (const f of editableFields) {
    if (body[f] !== undefined) updateData[f] = body[f] || null;
  }

  // Password change
  if (body.currentPassword && body.newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouve." }, { status: 404 });
    }

    const isValid = await validatePassword(body.currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
    }

    if (!isValidPassword(body.newPassword)) {
      return NextResponse.json({
        error: "Le nouveau mot de passe doit contenir 8+ caracteres, une majuscule, une minuscule et un chiffre.",
      }, { status: 400 });
    }

    updateData.password = await hashPassword(body.newPassword);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Aucune modification." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true, name: true, email: true, companyName: true,
      phone: true, address: true, city: true, postalCode: true,
    },
  });

  return NextResponse.json(user);
}
