import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const message = await prisma.contactMessage.findUnique({ where: { id } });

  if (!message) {
    return NextResponse.json({ error: "Message non trouve." }, { status: 404 });
  }

  // Mark as read
  if (!message.isRead) {
    await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  }

  return NextResponse.json({ ...message, isRead: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.isRead !== undefined) updateData.isRead = body.isRead;
  if (body.isArchived !== undefined) updateData.isArchived = body.isArchived;
  if (body.note !== undefined) updateData.note = body.note;

  const message = await prisma.contactMessage.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(message);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { id } = await params;
  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ message: "Message supprime." });
}
