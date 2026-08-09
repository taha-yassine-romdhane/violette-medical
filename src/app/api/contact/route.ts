import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`contact:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de messages envoyes. Reessayez plus tard." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { name, email, phone, subject, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Nom, email et message sont requis." },
      { status: 400 }
    );
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  await prisma.contactMessage.create({
    data: { name, email, phone, subject, message },
  });

  return NextResponse.json({ message: "Message envoye avec succes." }, { status: 201 });
}
