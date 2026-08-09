"use client";

import { useState, useEffect, useCallback } from "react";

interface OrderRow {
  id: string;
  orderNumber: string;
  totalTTC: number;
  status: string;
  note: string | null;
  createdAt: string;
  user: { name: string; companyName: string | null; email: string };
  _count: { items: number };
}

interface OrderDetail extends OrderRow {
  totalHT: number;
  totalTax: number;
  user: { name: string; companyName: string | null; email: string; phone: string | null };
  items: {
    id: string;
    quantity: number;
    nameFr: string;
    priceTTC: number;
    product: { id: string; nameFr: string; reference: string | null; thumbnail: string | null; trackSerial: boolean } | null;
    pack: { nameFr: string } | null;
    units: { id: string; serialNumber: string }[];
  }[];
}

interface AvailableUnit {
  id: string;
  serialNumber: string;
  assigned: boolean;
}

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"] as const;

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
  PENDING: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  CONFIRMED: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  PROCESSING: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  SHIPPED: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  DELIVERED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-red-500/15 text-red-300 border-red-500/30",
  RETURNED: "bg-gray-500/15 text-gray-300 border-gray-500/30",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [serialPicker, setSerialPicker] = useState<string | null>(null); // orderItemId
  const [availableUnits, setAvailableUnits] = useState<AvailableUnit[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [serialSaving, setSerialSaving] = useState(false);
  const [serialError, setSerialError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (searchDebounced) params.set("search", searchDebounced);
    const res = await fetch(`/api/admin/orders?${params}`);
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }, [statusFilter, searchDebounced]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function toggleDetail(orderId: string) {
    if (expanded === orderId) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(orderId);
    setDetailLoading(true);
    setDetail(null);
    const res = await fetch(`/api/admin/orders/${orderId}`);
    if (res.ok) setDetail(await res.json());
    setDetailLoading(false);
  }

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
      if (detail?.id === orderId) setDetail({ ...detail, status: updated.status });
    }
    setUpdating(null);
  }

  async function openSerialPicker(orderId: string, orderItemId: string) {
    if (serialPicker === orderItemId) {
      setSerialPicker(null);
      return;
    }
    setSerialPicker(orderItemId);
    setSerialError("");
    setAvailableUnits([]);
    const res = await fetch(`/api/admin/orders/${orderId}/serials?orderItemId=${orderItemId}`);
    if (res.ok) {
      const data = await res.json();
      setAvailableUnits(data.units);
      setSelectedUnits(new Set(data.units.filter((u: AvailableUnit) => u.assigned).map((u: AvailableUnit) => u.id)));
    } else {
      setSerialError("Impossible de charger les N° de série.");
    }
  }

  async function saveSerials(orderId: string, orderItemId: string) {
    setSerialSaving(true);
    setSerialError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/serials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId, unitIds: [...selectedUnits] }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setSerialError(data?.error || "Erreur lors de l'attribution.");
        return;
      }
      // Refresh the expanded detail
      if (detail) {
        setDetail({
          ...detail,
          items: detail.items.map((it) =>
            it.id === orderItemId ? { ...it, units: data.assigned } : it
          ),
        });
      }
      setSerialPicker(null);
    } catch {
      setSerialError("Erreur réseau.");
    } finally {
      setSerialSaving(false);
    }
  }

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Commandes</h1>
        <p className="text-sm text-gray-400 mt-1">Gérez les commandes et leurs statuts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="N° commande, client, email..."
            className="admin-input pl-10"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              !statusFilter
                ? "bg-purple-500/15 text-purple-300 border-purple-400/40"
                : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Toutes
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                statusFilter === s
                  ? statusColors[s]
                  : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {statusLabels[s]}
              {!statusFilter && counts[s] > 0 && <span className="ml-1 opacity-60">({counts[s]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white/[0.03] border-b border-white/10">
              <tr>
                <th className="admin-th">N° Commande</th>
                <th className="admin-th">Client</th>
                <th className="admin-th">Articles</th>
                <th className="admin-th">Total TTC</th>
                <th className="admin-th">Statut</th>
                <th className="admin-th">Date</th>
                <th className="admin-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <>
                    <tr key={order.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="admin-td font-mono font-medium text-white">{order.orderNumber}</td>
                      <td className="admin-td">
                        <div className="text-sm font-medium text-white">{order.user.name}</div>
                        <div className="text-xs text-gray-500">{order.user.companyName || order.user.email}</div>
                      </td>
                      <td className="admin-td text-gray-300">{order._count.items}</td>
                      <td className="admin-td font-semibold text-white tabular-nums">{order.totalTTC.toFixed(2)} TND</td>
                      <td className="admin-td">
                        <select
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full border px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/40 disabled:opacity-50 bg-transparent ${statusColors[order.status] || "border-white/15 text-gray-300"}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-gray-900 text-white">
                              {statusLabels[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="admin-td text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("fr-TN")}
                      </td>
                      <td className="admin-td text-right">
                        <button
                          onClick={() => toggleDetail(order.id)}
                          className="text-xs font-medium text-purple-300 hover:text-purple-200 transition-colors"
                        >
                          {expanded === order.id ? "Fermer" : "Détails"}
                        </button>
                      </td>
                    </tr>

                    {/* Detail row */}
                    {expanded === order.id && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={7} className="px-6 py-5 bg-white/[0.02]">
                          {detailLoading ? (
                            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto my-4" />
                          ) : detail ? (
                            <div className="grid lg:grid-cols-3 gap-6">
                              {/* Client info */}
                              <div>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Client</p>
                                <p className="text-sm text-white font-medium">{detail.user.name}</p>
                                {detail.user.companyName && <p className="text-sm text-gray-400">{detail.user.companyName}</p>}
                                <p className="text-sm text-gray-400">{detail.user.email}</p>
                                {detail.user.phone && <p className="text-sm text-gray-400">{detail.user.phone}</p>}
                                {detail.note && (
                                  <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                                    <p className="text-[11px] font-bold text-yellow-300/80 uppercase tracking-wider mb-0.5">Note</p>
                                    <p className="text-sm text-yellow-100/90">{detail.note}</p>
                                  </div>
                                )}
                              </div>

                              {/* Items */}
                              <div className="lg:col-span-2">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                  Articles ({detail.items.length})
                                </p>
                                <div className="space-y-1.5">
                                  {detail.items.map((item) => (
                                    <div key={item.id} className="bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5">
                                      <div className="flex items-center justify-between">
                                        <div className="min-w-0">
                                          <p className="text-sm text-white font-medium truncate">{item.nameFr}</p>
                                          {item.product?.reference && (
                                            <p className="text-xs text-gray-500 font-mono">{item.product.reference}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0 text-sm">
                                          <span className="text-gray-400">x{item.quantity}</span>
                                          <span className="text-white font-semibold tabular-nums w-24 text-right">
                                            {(item.priceTTC * item.quantity).toFixed(2)} TND
                                          </span>
                                        </div>
                                      </div>

                                      {/* Serial numbers for serialized products */}
                                      {item.product?.trackSerial && (
                                        <div className="mt-2 pt-2 border-t border-white/5">
                                          <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                                N° de série ({item.units.length}/{item.quantity})
                                              </span>
                                              {item.units.map((u) => (
                                                <span key={u.id} className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                                  {u.serialNumber}
                                                </span>
                                              ))}
                                              {item.units.length === 0 && (
                                                <span className="text-[11px] text-yellow-300/80">Aucun attribué</span>
                                              )}
                                            </div>
                                            <button
                                              onClick={() => openSerialPicker(detail.id, item.id)}
                                              className="text-xs font-medium text-purple-300 hover:text-purple-200 transition-colors shrink-0"
                                            >
                                              {serialPicker === item.id ? "Fermer" : "Attribuer"}
                                            </button>
                                          </div>

                                          {/* Picker */}
                                          {serialPicker === item.id && (
                                            <div className="mt-2.5 bg-gray-900 border border-white/10 rounded-lg p-3">
                                              {availableUnits.length === 0 && !serialError ? (
                                                <p className="text-xs text-gray-400">
                                                  Aucune unité en stock pour ce produit — réceptionnez une importation d&apos;abord.
                                                </p>
                                              ) : (
                                                <>
                                                  <p className="text-[11px] text-gray-500 mb-2">
                                                    Sélectionnez jusqu&apos;à {item.quantity} unité{item.quantity > 1 ? "s" : ""} :
                                                  </p>
                                                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                                    {availableUnits.map((u) => {
                                                      const checked = selectedUnits.has(u.id);
                                                      const full = selectedUnits.size >= item.quantity && !checked;
                                                      return (
                                                        <button
                                                          key={u.id}
                                                          disabled={full}
                                                          onClick={() => {
                                                            const next = new Set(selectedUnits);
                                                            if (checked) next.delete(u.id);
                                                            else next.add(u.id);
                                                            setSelectedUnits(next);
                                                          }}
                                                          className={`px-2 py-1 text-[11px] font-mono rounded-md border transition-colors ${
                                                            checked
                                                              ? "bg-purple-600 text-white border-purple-500"
                                                              : full
                                                              ? "bg-white/5 text-gray-600 border-white/10 cursor-not-allowed"
                                                              : "bg-white/5 text-gray-300 border-white/15 hover:border-purple-400/50 hover:text-white"
                                                          }`}
                                                        >
                                                          {u.serialNumber}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                  <div className="flex items-center justify-between mt-3">
                                                    <span className="text-[11px] text-gray-500 tabular-nums">
                                                      {selectedUnits.size}/{item.quantity} sélectionné{selectedUnits.size > 1 ? "s" : ""}
                                                    </span>
                                                    <button
                                                      onClick={() => saveSerials(detail.id, item.id)}
                                                      disabled={serialSaving}
                                                      className="btn-primary px-3 py-1.5 text-xs"
                                                    >
                                                      {serialSaving ? "..." : "Enregistrer"}
                                                    </button>
                                                  </div>
                                                </>
                                              )}
                                              {serialError && (
                                                <p className="text-xs text-red-300 mt-2">{serialError}</p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-end gap-6 mt-3 pt-3 border-t border-white/10 text-sm">
                                  <span className="text-gray-400">HT: <span className="text-gray-200 tabular-nums">{detail.totalHT.toFixed(2)}</span></span>
                                  <span className="text-gray-400">TVA: <span className="text-gray-200 tabular-nums">{detail.totalTax.toFixed(2)}</span></span>
                                  <span className="text-gray-400">TTC: <span className="text-purple-300 font-bold tabular-nums">{detail.totalTTC.toFixed(2)} TND</span></span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-2">Erreur de chargement.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
