import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter"); // unread, archived

  const where: Record<string, unknown> = {};
  if (filter === "unread") {
    where.isRead = false;
    where.isArchived = false;
  } else if (filter === "archived") {
    where.isArchived = true;
  } else {
    where.isArchived = false;
  }

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = await prisma.contactMessage.count({ where: { isRead: false, isArchived: false } });

  return NextResponse.json({ messages, unreadCount });
}
