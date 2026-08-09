import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
  const { authorized, response } = await requireRole("ADMIN");
  if (!authorized) return response;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalRevenue,
    monthlyRevenue,
    monthlyOrders,
    totalOrders,
    newClients,
    ordersByStatus,
    topProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalTTC: true },
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } },
      _sum: { totalTTC: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: startOfMonth } } }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.orderItem.groupBy({
      by: ["nameFr"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Monthly revenue for the current year (simple approach without raw SQL)
  const ordersThisYear = await prisma.order.findMany({
    where: { createdAt: { gte: startOfYear }, status: { not: "CANCELLED" } },
    select: { createdAt: true, totalTTC: true },
  });

  const monthlyData: Record<number, number> = {};
  for (const o of ordersThisYear) {
    const month = o.createdAt.getMonth();
    monthlyData[month] = (monthlyData[month] || 0) + o.totalTTC;
  }

  const monthNames = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
  const revenueByMonth = monthNames.map((name, i) => ({
    month: name,
    revenue: Math.round((monthlyData[i] || 0) * 100) / 100,
  }));

  // Revenue by commercial
  const commercials = await prisma.user.findMany({
    where: { role: "COMMERCIAL" },
    select: {
      name: true,
      createdUsers: {
        where: { role: "USER" },
        select: { id: true },
      },
    },
  });

  const revenueByCommercial = await Promise.all(
    commercials.map(async (c) => {
      const clientIds = c.createdUsers.map((u) => u.id);
      if (clientIds.length === 0) return { name: c.name, revenue: 0 };
      const rev = await prisma.order.aggregate({
        where: { userId: { in: clientIds }, status: { not: "CANCELLED" } },
        _sum: { totalTTC: true },
      });
      return { name: c.name, revenue: rev._sum.totalTTC ?? 0 };
    })
  );

  const avgOrderValue = totalOrders > 0
    ? Math.round(((totalRevenue._sum.totalTTC ?? 0) / totalOrders) * 100) / 100
    : 0;

  return NextResponse.json({
    kpis: {
      totalRevenue: totalRevenue._sum.totalTTC ?? 0,
      monthlyRevenue: monthlyRevenue._sum.totalTTC ?? 0,
      monthlyOrders,
      avgOrderValue,
      newClients,
    },
    charts: {
      revenueByMonth,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      topProducts: topProducts.map((p) => ({
        name: p.nameFr,
        quantity: p._sum.quantity ?? 0,
      })),
      revenueByCommercial,
    },
  });
}
