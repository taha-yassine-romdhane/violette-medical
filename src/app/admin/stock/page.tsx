"use client";

import Link from "next/link";

import { useState, useEffect, useCallback } from "react";

interface StockItem {
  id: string;
  nameFr: string;
  reference: string | null;
  stock: number;
  minStock: number;
  isActive: boolean;
  thumbnail: string | null;
  images: string[];
  category: { id: string; nameFr: string };
}

type StockFilter = "all" | "out" | "low" | "ok";

export default function AdminStockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<string, { stock: string; minStock: string }>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");

  const fetchStock = useCallback(async () => {
    const res = await fetch("/api/admin/stock");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const totalProducts = items.length;
  const outOfStock = items.filter((i) => i.stock <= 0).length;
  const lowStock = items.filter((i) => i.stock > 0 && i.stock <= i.minStock).length;
  const wellStocked = items.filter((i) => i.stock > i.minStock).length;

  const editCount = Object.keys(editValues).length;

  // Filtered items
  const filtered = items.filter((item) => {
    if (filter === "out" && item.stock > 0) return false;
    if (filter === "low" && !(item.stock > 0 && item.stock <= item.minStock)) return false;
    if (filter === "ok" && item.stock <= item.minStock) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!item.nameFr.toLowerCase().includes(q) && !(item.reference || "").toLowerCase().includes(q) && !item.category.nameFr.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  function startEdit(id: string, stock: number, minStock: number) {
    setEditValues((prev) => ({ ...prev, [id]: { stock: String(stock), minStock: String(minStock) } }));
  }

  function cancelEdit(id: string) {
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function saveBulk() {
    // Empty or invalid fields become 0; negative values are clamped to 0
    const updates = Object.entries(editValues).map(([id, vals]) => ({
      id,
      stock: Math.max(0, parseInt(vals.stock, 10) || 0),
      minStock: Math.max(0, parseInt(vals.minStock, 10) || 0),
    }));
    if (updates.length === 0) return;

    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/stock/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);

    if (res.ok) {
      setEditValues({});
      setSuccess(`${updates.length} produit(s) mis à jour.`);
      fetchStock();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError("Échec de l'enregistrement du stock. Réessayez.");
      setTimeout(() => setError(""), 5000);
    }
  }

  function getStockStatus(item: StockItem): { label: string; color: string; bg: string; dot: string } {
    if (item.stock <= 0) return { label: "Rupture", color: "text-red-300", bg: "bg-red-500/15 border-red-500/30", dot: "bg-red-400" };
    if (item.stock <= item.minStock) return { label: "Bas", color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/30", dot: "bg-amber-400" };
    return { label: "OK", color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/30", dot: "bg-emerald-400" };
  }

  function getStockBarPercent(item: StockItem): number {
    if (item.minStock <= 0) return item.stock > 0 ? 100 : 0;
    // Use 3x minStock as "full"
    const max = item.minStock * 3;
    return Math.min(100, Math.max(0, (item.stock / max) * 100));
  }

  function getStockBarColor(item: StockItem): string {
    if (item.stock <= 0) return "bg-red-500";
    if (item.stock <= item.minStock) return "bg-amber-500";
    return "bg-emerald-500";
  }

  function getProductImage(item: StockItem): string | null {
    return item.thumbnail || (item.images.length > 0 ? item.images[0] : null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards: { key: StockFilter; label: string; value: number; icon: React.ReactNode; color: string; activeColor: string }[] = [
    {
      key: "all",
      label: "Total produits",
      value: totalProducts,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "bg-white/[0.04] text-gray-300 border-white/10",
      activeColor: "bg-white/10 text-white border-white/30 ring-2 ring-white/20",
    },
    {
      key: "out",
      label: "Rupture",
      value: outOfStock,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: "bg-red-500/10 text-red-300 border-red-500/25",
      activeColor: "bg-red-500/20 text-red-200 border-red-400/60 ring-2 ring-red-500/30",
    },
    {
      key: "low",
      label: "Stock bas",
      value: lowStock,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
      color: "bg-amber-500/10 text-amber-300 border-amber-500/25",
      activeColor: "bg-amber-500/20 text-amber-200 border-amber-400/60 ring-2 ring-amber-500/30",
    },
    {
      key: "ok",
      label: "Bien approvisionné",
      value: wellStocked,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
      activeColor: "bg-emerald-500/20 text-emerald-200 border-emerald-400/60 ring-2 ring-emerald-500/30",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Gestion du stock</h1>
          <p className="text-sm text-gray-400 mt-1">Surveillez et mettez à jour les niveaux de stock</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/stock/movements"
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white border border-white/15 transition-colors"
          >
            Mouvements
          </Link>
          <Link href="/admin/importations" className="btn-primary px-4 py-2.5 text-sm">
            Importations
          </Link>
        </div>
        {editCount > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditValues({})}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white border border-white/15 transition-colors"
            >
              Annuler tout
            </button>
            <button
              onClick={saveBulk}
              disabled={saving}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {saving ? "Enregistrement..." : `Enregistrer (${editCount})`}
            </button>
          </div>
        )}
      </div>

      {/* Stat cards — clickable as filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <button
            key={card.key}
            onClick={() => setFilter(filter === card.key ? "all" : card.key)}
            className={`rounded-xl p-4 border text-left transition-all ${filter === card.key ? card.activeColor : card.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                {card.icon}
              </div>
              {filter === card.key && card.key !== "all" && (
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Filtre actif</span>
              )}
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm mt-0.5 opacity-80">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Success / error toasts */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, référence ou catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10 pr-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Stock list */}
      <div className="admin-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_120px_100px_80px_60px] gap-4 px-5 py-3 bg-white/[0.03] border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span>Produit</span>
          <span>Niveau de stock</span>
          <span>Stock / Min</span>
          <span>Statut</span>
          <span className="text-right">Action</span>
        </div>

        {/* Items */}
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm text-gray-400">Aucun produit trouvé.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((item) => {
              const editing = editValues[item.id];
              const status = getStockStatus(item);
              const barPercent = getStockBarPercent(item);
              const barColor = getStockBarColor(item);
              const img = getProductImage(item);

              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-[1fr_120px_100px_80px_60px] gap-4 px-5 py-3.5 items-center transition-colors ${
                    editing ? "bg-purple-500/10" : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Product info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.nameFr}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.reference && (
                          <span className="text-[11px] text-gray-500 font-mono">{item.reference}</span>
                        )}
                        <span className="text-[11px] text-gray-500">{item.category.nameFr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock bar */}
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stock / Min values */}
                  <div>
                    {editing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editing.stock}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, [item.id]: { ...prev[item.id], stock: e.target.value } }))}
                          className="w-14 px-1.5 py-1 bg-white/5 border border-purple-400/50 rounded text-xs text-white text-center focus:ring-2 focus:ring-purple-500/40 outline-none"
                        />
                        <span className="text-gray-600 text-xs">/</span>
                        <input
                          type="number"
                          value={editing.minStock}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, [item.id]: { ...prev[item.id], minStock: e.target.value } }))}
                          className="w-14 px-1.5 py-1 bg-white/5 border border-white/15 rounded text-xs text-white text-center focus:ring-2 focus:ring-purple-500/40 outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-semibold ${item.stock <= 0 ? "text-red-300" : item.stock <= item.minStock ? "text-amber-300" : "text-white"}`}>
                          {item.stock}
                        </span>
                        <span className="text-gray-600 text-xs">/</span>
                        <span className="text-xs text-gray-500">{item.minStock}</span>
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold rounded-full border ${status.bg} ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    {editing ? (
                      <button
                        onClick={() => cancelEdit(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white transition-colors"
                        title="Annuler"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(item.id, item.stock, item.minStock)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/10 hover:text-purple-300 transition-colors"
                        title="Modifier le stock"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-white/[0.03] border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {filtered.length} produit{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
              {filter !== "all" && ` (filtre: ${statCards.find((c) => c.key === filter)?.label})`}
            </span>
            {editCount > 0 && (
              <span className="text-xs text-purple-300 font-medium">
                {editCount} modification{editCount > 1 ? "s" : ""} en attente
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
