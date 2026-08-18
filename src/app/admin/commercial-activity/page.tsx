import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CommercialActivityPage() {
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

      const [totalOrders, monthlyOrders, totalRev, monthlyRev] = await Promise.all([
        clientIds.length > 0
          ? prisma.order.count({ where: { userId: { in: clientIds } } })
          : 0,
        clientIds.length > 0
          ? prisma.order.count({ where: { userId: { in: clientIds }, createdAt: { gte: startOfMonth } } })
          : 0,
        clientIds.length > 0
          ? prisma.order.aggregate({ where: { userId: { in: clientIds }, status: { not: "CANCELLED" } }, _sum: { totalTTC: true } })
          : { _sum: { totalTTC: null } },
        clientIds.length > 0
          ? prisma.order.aggregate({ where: { userId: { in: clientIds }, status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } }, _sum: { totalTTC: true } })
          : { _sum: { totalTTC: null } },
      ]);

      return {
        name: c.name,
        email: c.email,
        isActive: c.isActive,
        clientCount: clientIds.length,
        totalOrders,
        monthlyOrders,
        totalRevenue: totalRev._sum.totalTTC ?? 0,
        monthlyRevenue: monthlyRev._sum.totalTTC ?? 0,
      };
    })
  );

  const totalCommercials = commercials.length;
  const totalClients = performance.reduce((s, p) => s + p.clientCount, 0);
  const totalRevenue = performance.reduce((s, p) => s + p.totalRevenue, 0);
  const monthlyOrdersTotal = performance.reduce((s, p) => s + p.monthlyOrders, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Activité Commerciaux</h1>
        <p className="text-sm text-gray-500 mt-1">Performance de l'équipe commerciale</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Commerciaux", value: totalCommercials, color: "bg-blue-50 text-blue-700 border border-blue-200/60" },
          { label: "Clients total", value: totalClients, color: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
          { label: "CA total", value: `${totalRevenue.toFixed(2)} TND`, color: "bg-gray-900 text-white border border-gray-900" },
          { label: "Commandes ce mois", value: monthlyOrdersTotal, color: "bg-amber-50 text-amber-700 border border-amber-200/60" },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl p-5 ${card.color}`}>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Performance table */}
      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="admin-th">Commercial</th>
              <th className="admin-th">Clients</th>
              <th className="admin-th">Commandes</th>
              <th className="admin-th">CA total</th>
              <th className="admin-th">CA mensuel</th>
              <th className="admin-th">Cmd/mois</th>
              <th className="admin-th">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performance.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucun commercial.</td></tr>
            ) : (
              performance.map((p) => (
                <tr key={p.email} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium tabular-nums">{p.clientCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 tabular-nums">{p.totalOrders}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium tabular-nums">{p.totalRevenue.toFixed(2)} TND</td>
                  <td className="px-6 py-4 text-sm text-gray-700 tabular-nums">{p.monthlyRevenue.toFixed(2)} TND</td>
                  <td className="px-6 py-4 text-sm text-gray-700 tabular-nums">{p.monthlyOrders}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {p.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
