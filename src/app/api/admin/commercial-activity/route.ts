import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const commercials = await prisma.user.findMany({
    where: { role: "COMMERCIAL" },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdUsers: {
        where: { role: "USER" },
        select: { id: true },
      },
    },
  });

  const performance = await Promise.all(
    commercials.map(async (c) => {
      const clientIds = c.createdUsers.map((u) => u.id);

      const [totalOrders, monthlyOrders, totalRevenue, monthlyRevenue] = await Promise.all([
        clientIds.length > 0
          ? prisma.order.count({ where: { userId: { in: clientIds } } })
          : Promise.resolve(0),
        clientIds.length > 0
          ? prisma.order.count({
              where: { userId: { in: clientIds }, createdAt: { gte: startOfMonth } },
            })
          : Promise.resolve(0),
        clientIds.length > 0
          ? prisma.order.aggregate({
              where: { userId: { in: clientIds }, status: { not: "CANCELLED" } },
              _sum: { totalTTC: true },
            })
          : Promise.resolve({ _sum: { totalTTC: null } }),
        clientIds.length > 0
          ? prisma.order.aggregate({
              where: {
                userId: { in: clientIds },
                status: { not: "CANCELLED" },
                createdAt: { gte: startOfMonth },
              },
              _sum: { totalTTC: true },
            })
          : Promise.resolve({ _sum: { totalTTC: null } }),
      ]);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        isActive: c.isActive,
        clientCount: clientIds.length,
        totalOrders,
        monthlyOrders,
        totalRevenue: totalRevenue._sum.totalTTC ?? 0,
        monthlyRevenue: monthlyRevenue._sum.totalTTC ?? 0,
      };
    })
  );

  const summary = {
    totalCommercials: commercials.length,
    totalClients: performance.reduce((s, p) => s + p.clientCount, 0),
    totalRevenue: performance.reduce((s, p) => s + p.totalRevenue, 0),
    monthlyOrders: performance.reduce((s, p) => s + p.monthlyOrders, 0),
  };

  return NextResponse.json({ summary, performance });
}
