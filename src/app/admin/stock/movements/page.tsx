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
  IMPORT: { label: "Importation", cls: "bg-emerald-500/15 text-emerald-300" },
  SALE: { label: "Vente", cls: "bg-purple-500/15 text-purple-300" },
  ADJUSTMENT: { label: "Ajustement", cls: "bg-yellow-500/15 text-yellow-300" },
  RETURN: { label: "Retour", cls: "bg-blue-500/15 text-blue-300" },
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
            <Link href="/admin/stock" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white">Mouvements de stock</h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Historique complet des entrées, sorties et ajustements ({total} mouvement{total !== 1 ? "s" : ""})
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setTypeFilter("")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              !typeFilter
                ? "bg-purple-500/15 text-purple-300 border-purple-400/40"
                : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
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
                  : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
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
            <thead className="bg-white/[0.03] border-b border-white/10">
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
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <p className="text-gray-400 font-medium">Aucun mouvement enregistré</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Les importations, ventes et ajustements apparaîtront ici.
                    </p>
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="admin-td text-gray-400 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString("fr-TN")}{" "}
                      <span className="text-gray-600">
                        {new Date(m.createdAt).toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="admin-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white overflow-hidden shrink-0">
                          {m.product.thumbnail && (
                            <Image src={m.product.thumbnail} alt="" width={36} height={36} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate max-w-[220px]">{m.product.nameFr}</p>
                          {m.product.reference && <p className="text-xs text-gray-500 font-mono">{m.product.reference}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="admin-td">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${typeConfig[m.type]?.cls || "bg-gray-500/15 text-gray-300"}`}>
                        {typeConfig[m.type]?.label || m.type}
                      </span>
                    </td>
                    <td className={`admin-td font-bold tabular-nums ${m.delta > 0 ? "text-emerald-300" : "text-red-300"}`}>
                      {m.delta > 0 ? `+${m.delta}` : m.delta}
                    </td>
                    <td className="admin-td text-white font-medium tabular-nums">{m.stockAfter}</td>
                    <td className="admin-td text-gray-400 font-mono text-xs">{m.reference || m.reason || "—"}</td>
                    <td className="admin-td text-gray-400">{m.user?.name || "—"}</td>
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
            className="px-3.5 py-2 text-sm text-gray-300 border border-white/15 rounded-xl hover:bg-white/5 hover:text-white disabled:opacity-40 transition-colors"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-400 px-2 tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3.5 py-2 text-sm text-gray-300 border border-white/15 rounded-xl hover:bg-white/5 hover:text-white disabled:opacity-40 transition-colors"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
