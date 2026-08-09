import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { auth } from "@/auth";

export async function PATCH(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const body = await request.json();
  const { updates } = body as { updates: { id: string; stock: number; minStock?: number }[] };

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "Aucune mise à jour fournie." }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id || null;

  const results = await prisma.$transaction(async (tx) => {
    const out = [];
    for (const u of updates) {
      const before = await tx.product.findUnique({
        where: { id: u.id },
        select: { stock: true },
      });
      const updated = await tx.product.update({
        where: { id: u.id },
        data: {
          stock: u.stock,
          ...(u.minStock !== undefined ? { minStock: u.minStock } : {}),
        },
        select: { id: true, stock: true, minStock: true },
      });
      // Log manual adjustments so the stock history stays complete
      const delta = updated.stock - (before?.stock ?? 0);
      if (delta !== 0) {
        await tx.stockMovement.create({
          data: {
            productId: u.id,
            type: "ADJUSTMENT",
            delta,
            stockAfter: updated.stock,
            reason: "Ajustement manuel",
            userId,
          },
        });
      }
      out.push(updated);
    }
    return out;
  });

  return NextResponse.json({ updated: results.length, results });
}
