"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Movement {
  id: string;
  type: "IMPORT" | "SALE" | "ADJUSTMENT" | "RETURN";
  delta: number;
  stockAfter: number;
  reference: string | null;
  reason: string | null;
  createdAt: string;
  product: { nameFr: string; reference: string | null; thumbnail: string | null };
  user: { name: string } | null;
}

const typeConfig: Record<string, { label: string; cls: string }> = {
  IMPORT: { label: "Importation", cls: "bg-emerald-50 text-emerald-700" },
  SALE: { label: "Vente", cls: "bg-gray-100 text-gray-700" },
  ADJUSTMENT: { label: "Ajustement", cls: "bg-amber-50 text-amber-700" },
  RETURN: { label: "Retour", cls: "bg-blue-50 text-blue-700" },
};

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      params.set("page", String(page));
      const res = await fetch(`/api/admin/stock/movements?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMovements(data.movements);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [typeFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [typeFilter]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/stock" className="text-gray-500 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Mouvements de stock</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Historique complet des entrées, sorties et ajustements ({total} mouvement{total !== 1 ? "s" : ""})
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setTypeFilter("")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              !typeFilter
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Tous
          </button>
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? "" : key)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                typeFilter === key
                  ? `${cfg.cls} border-current/40`
                  : "border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="admin-th">Date</th>
                <th className="admin-th">Produit</th>
                <th className="admin-th">Type</th>
                <th className="admin-th">Quantité</th>
                <th className="admin-th">Stock après</th>
                <th className="admin-th">Référence</th>
                <th className="admin-th">Par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <p className="text-gray-500 font-medium">Aucun mouvement enregistré</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Les importations, ventes et ajustements apparaîtront ici.
                    </p>
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="admin-td text-gray-500 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString("fr-TN")}{" "}
                      <span className="text-gray-400">
                        {new Date(m.createdAt).toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="admin-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                          {m.product.thumbnail && (
                            <Image src={m.product.thumbnail} alt="" width={36} height={36} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{m.product.nameFr}</p>
                          {m.product.reference && <p className="text-xs text-gray-500 font-mono">{m.product.reference}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="admin-td">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${typeConfig[m.type]?.cls || "bg-gray-100 text-gray-700"}`}>
                        {typeConfig[m.type]?.label || m.type}
                      </span>
                    </td>
                    <td className={`admin-td font-bold tabular-nums ${m.delta > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {m.delta > 0 ? `+${m.delta}` : m.delta}
                    </td>
                    <td className="admin-td text-gray-900 font-medium tabular-nums">{m.stockAfter}</td>
                    <td className="admin-td text-gray-500 font-mono text-xs">{m.reference || m.reason || "—"}</td>
                    <td className="admin-td text-gray-500">{m.user?.name || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-2 text-sm text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 transition-colors"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-500 px-2 tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3.5 py-2 text-sm text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 transition-colors"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
