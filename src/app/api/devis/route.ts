import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/auth-utils";

interface DevisItem {
  id: string;
  nameFr: string;
  reference: string | null;
  qty: number;
}

/**
 * Guest quote request ("demande de devis") from the storefront cart.
 * Stored as a ContactMessage so it lands in the admin Messages inbox
 * (unread badge, notes, archive) without a separate pipeline.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`devis:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de demandes envoyées. Réessayez plus tard." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { name, company, email, phone, message, items } = body as {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    message?: string;
    items?: DevisItem[];
  };

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Nom, email et téléphone sont requis." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Votre demande est vide." }, { status: 400 });
  }
  if (items.length > 100) {
    return NextResponse.json({ error: "Demande trop volumineuse." }, { status: 400 });
  }

  // Re-read product names/refs from the DB so the stored request can't be spoofed
  const ids = items.map((i) => String(i.id));
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, nameFr: true, reference: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = items
    .filter((i) => byId.has(String(i.id)))
    .map((i) => {
      const p = byId.get(String(i.id))!;
      const qty = Math.max(1, Math.min(9999, Math.round(Number(i.qty) || 1)));
      return `• ${qty} × ${p.nameFr}${p.reference ? ` (REF: ${p.reference})` : ""}`;
    });

  if (lines.length === 0) {
    return NextResponse.json({ error: "Produits introuvables." }, { status: 400 });
  }

  const itemCount = lines.length;
  const messageBody = [
    "DEMANDE DE DEVIS — produits demandés :",
    "",
    ...lines,
    "",
    company ? `Société : ${company}` : null,
    message ? `Message du client :\n${message}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone: phone || null,
      subject: `Demande de devis — ${itemCount} produit${itemCount > 1 ? "s" : ""}`,
      message: messageBody,
    },
  });

  return NextResponse.json(
    { message: "Demande envoyée avec succès.", body: messageBody },
    { status: 201 }
  );
}
