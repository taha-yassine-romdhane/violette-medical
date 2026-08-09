import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const folder = (formData.get("folder") as string) || "uploads";

  if (files.length === 0) {
    return NextResponse.json({ error: "Fichier(s) requis." }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxSize = 5 * 1024 * 1024;

  // Sanitize folder to prevent path traversal
  const safeFolder = folder.replace(/\.\./g, "").replace(/[^a-zA-Z0-9_\-/]/g, "");
  const uploadDir = path.join(process.cwd(), "public", safeFolder);
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Format non supporte: ${file.name}. Utilisez JPG, PNG, WebP ou AVIF.` },
        { status: 400 }
      );
    }
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `${file.name} trop volumineux (max 5 Mo).` },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, safeName), bytes);

    urls.push(`/${safeFolder}/${safeName}`);
  }

  return NextResponse.json({ urls });
}
