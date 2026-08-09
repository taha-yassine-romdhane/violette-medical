export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function CommercialDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const [clientCount, orderCount, pendingOrders] = await Promise.all([
    prisma.user.count({ where: { createdById: userId, role: "USER" } }),
    prisma.order.count({
      where: { user: { createdById: userId } },
    }),
    prisma.order.count({
      where: { user: { createdById: userId }, status: "PENDING" },
    }),
  ]);

  const stats = [
    { label: "Mes clients", value: clientCount, color: "bg-green-500" },
    { label: "Commandes clients", value: orderCount, color: "bg-purple-500" },
    { label: "En attente", value: pendingOrders, color: "bg-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Tableau de bord
      </h1>
      <p className="text-gray-500 mb-8">
        Bienvenue, {session!.user.name}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
