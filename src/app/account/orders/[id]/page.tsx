export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmee",
  PROCESSING: "En traitement",
  SHIPPED: "Expediee",
  DELIVERED: "Livree",
  CANCELLED: "Annulee",
  RETURNED: "Retournee",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-300",
  PROCESSING: "bg-indigo-100 text-indigo-700 border-indigo-300",
  SHIPPED: "bg-purple-100 text-purple-700 border-purple-300",
  DELIVERED: "bg-green-100 text-green-700 border-green-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
  RETURNED: "bg-gray-100 text-gray-700 border-gray-300",
};

const statusDotColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  CONFIRMED: "bg-blue-500",
  PROCESSING: "bg-indigo-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
  RETURNED: "bg-gray-500",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id, userId: session!.user.id },
    include: {
      items: {
        include: {
          product: { select: { nameFr: true, thumbnail: true, slug: true } },
          pack: { select: { nameFr: true, image: true, slug: true } },
        },
      },
      steps: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-purple-700 hover:text-purple-900 font-medium mb-5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
        Mes commandes
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commande {order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Passee le {new Date(order.createdAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}
          </p>
        </div>
        <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${statusColors[order.status] || ""}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Articles</h2>
          {order.items.map((item) => {
            const name = item.nameFr;
            const thumb = item.product?.thumbnail || item.pack?.image;
            const slug = item.product?.slug;

            return (
              <div key={item.id} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
                {thumb ? (
                  <img src={thumb} alt={name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {slug ? (
                    <Link href={`/products/${slug}`} className="text-sm font-medium text-gray-900 hover:text-purple-700 truncate block">{name}</Link>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                  )}
                  <p className="text-xs text-gray-500">Qte: {item.quantity} &times; {item.priceTTC.toFixed(2)} TND</p>
                </div>
                <p className="text-sm font-bold text-gray-900 shrink-0">
                  {(item.priceTTC * item.quantity).toFixed(2)} TND
                </p>
              </div>
            );
          })}

          {/* Totals */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total HT</span>
                <span>{order.totalHT.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA</span>
                <span>{order.totalTax.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total TTC</span>
                <span className="text-purple-700">{order.totalTTC.toFixed(2)} TND</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Suivi</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {order.steps.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune etape enregistree.</p>
            ) : (
              <div className="space-y-0">
                {order.steps.map((step, idx) => {
                  const isLast = idx === order.steps.length - 1;
                  return (
                    <div key={step.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${isLast ? statusDotColors[step.status] || "bg-gray-400" : "bg-gray-300"}`} />
                        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                      </div>
                      <div className={`pb-4 ${!isLast ? "" : ""}`}>
                        <p className={`text-sm font-medium ${isLast ? "text-gray-900" : "text-gray-500"}`}>
                          {statusLabels[step.status] || step.status}
                        </p>
                        {step.note && <p className="text-xs text-gray-400 mt-0.5">{step.note}</p>}
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(step.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
