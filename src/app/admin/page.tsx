import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();

  const [
    commercialCount, clientCount, orderCount, pendingOrders,
    productCount, outOfStockCount, unreadMessages, recentOrders,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "COMMERCIAL" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { stock: { lte: 0 }, isActive: true } }),
    prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, companyName: true } },
      },
    }),
  ]);

  const stats = [
    {
      label: "Commerciaux",
      value: commercialCount,
      href: "/admin/users",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-blue-500/15 text-blue-300",
    },
    {
      label: "Clients",
      value: clientCount,
      href: "/admin/clients",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "bg-emerald-500/15 text-emerald-300",
    },
    {
      label: "Commandes",
      value: orderCount,
      href: "/admin/orders",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "bg-purple-500/15 text-purple-300",
    },
    {
      label: "En attente",
      value: pendingOrders,
      href: "/admin/orders",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-amber-500/15 text-amber-300",
    },
    {
      label: "Produits",
      value: productCount,
      href: "/admin/products",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "bg-indigo-500/15 text-indigo-300",
    },
    {
      label: "Messages non lus",
      value: unreadMessages,
      href: "/admin/messages",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-rose-500/15 text-rose-300",
    },
  ];

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    PROCESSING: "En traitement",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
    RETURNED: "Retournée",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-300",
    CONFIRMED: "bg-blue-500/15 text-blue-300",
    PROCESSING: "bg-indigo-500/15 text-indigo-300",
    SHIPPED: "bg-purple-500/15 text-purple-300",
    DELIVERED: "bg-emerald-500/15 text-emerald-300",
    CANCELLED: "bg-red-500/15 text-red-300",
    RETURNED: "bg-gray-500/15 text-gray-300",
  };

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Bonjour, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-400 mt-1">
          Voici un aperçu de votre plateforme.
        </p>
      </div>

      {/* Out of stock alert */}
      {outOfStockCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-200">{outOfStockCount} produit(s) en rupture de stock</p>
              <p className="text-xs text-red-300/80">Vérifiez votre stock et réapprovisionnez les produits concernés.</p>
            </div>
          </div>
          <Link href="/admin/stock" className="text-sm font-medium text-red-300 hover:text-red-200 whitespace-nowrap">
            Voir le stock
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="admin-card p-4 hover:border-purple-400/40 hover:bg-white/[0.07] transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-purple-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="admin-card p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
            Actions rapides
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-300 group-hover:bg-purple-500/25 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Ajouter un produit</span>
            </Link>
            <Link
              href="/admin/messages"
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-300 group-hover:bg-rose-500/25 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Voir les messages</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-300 group-hover:bg-blue-500/25 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Ajouter un commercial</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-300 group-hover:bg-emerald-500/25 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Voir les commandes</span>
            </Link>
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Dernières commandes
            </h2>
            <Link href="/admin/orders" className="text-xs text-purple-300 hover:text-purple-200 font-medium">
              Tout voir
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Aucune commande pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-300 uppercase">
                      {order.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{order.user.name}</p>
                      <p className="text-xs text-gray-500">{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${statusColors[order.status] || ""}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <span className="text-sm font-semibold text-white w-24 text-right tabular-nums">
                      {order.totalTTC.toFixed(2)} TND
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
