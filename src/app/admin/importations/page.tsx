"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ImportationRow {
  id: string;
  reference: string;
  supplier: string;
  invoiceNumber: string | null;
  arrivalDate: string;
  status: "DRAFT" | "RECEIVED";
  lineCount: number;
  totalQuantity: number;
  createdAt: string;
}

export default function AdminImportationsPage() {
  const router = useRouter();
  const [importations, setImportations] = useState<ImportationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ supplier: "Yuwell", invoiceNumber: "", arrivalDate: "", note: "" });
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/importations");
      if (res.ok) setImportations(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate() {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/importations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Erreur lors de la création.");
        return;
      }
      router.push(`/admin/importations/${data.id}`);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setCreating(false);
    }
  }

  const draftCount = importations.filter((i) => i.status === "DRAFT").length;
  const receivedCount = importations.filter((i) => i.status === "RECEIVED").length;
  const totalUnits = importations.filter((i) => i.status === "RECEIVED").reduce((s, i) => s + i.totalQuantity, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Importations</h1>
          <p className="text-sm text-gray-400 mt-1">
            Réceptionnez vos arrivages fournisseur et enregistrez les numéros de série
          </p>
        </div>
        <button onClick={() => { setShowCreate(true); setError(""); }} className="btn-primary px-4 py-2.5 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle importation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Brouillons", value: draftCount, cls: "bg-yellow-500/15 text-yellow-300 border-yellow-400/20" },
          { label: "Réceptionnées", value: receivedCount, cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20" },
          { label: "Unités importées", value: totalUnits, cls: "bg-purple-500/15 text-purple-300 border-purple-400/20" },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl border p-5 ${c.cls}`}>
            <p className="text-2xl font-bold tabular-nums">{c.value}</p>
            <p className="text-sm mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-white/[0.03] border-b border-white/10">
              <tr>
                <th className="admin-th">Référence</th>
                <th className="admin-th">Fournisseur</th>
                <th className="admin-th">Facture</th>
                <th className="admin-th">Date d&apos;arrivée</th>
                <th className="admin-th">Lignes</th>
                <th className="admin-th">Quantité</th>
                <th className="admin-th">Statut</th>
                <th className="admin-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : importations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-400 font-medium">Aucune importation pour le moment</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Créez votre première importation pour réceptionner du stock.
                    </p>
                  </td>
                </tr>
              ) : (
                importations.map((imp) => (
                  <tr key={imp.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="admin-td">
                      <Link href={`/admin/importations/${imp.id}`} className="font-mono font-semibold text-purple-300 hover:text-purple-200 transition-colors">
                        {imp.reference}
                      </Link>
                    </td>
                    <td className="admin-td text-white">{imp.supplier}</td>
                    <td className="admin-td text-gray-400">{imp.invoiceNumber || "—"}</td>
                    <td className="admin-td text-gray-300">
                      {new Date(imp.arrivalDate).toLocaleDateString("fr-TN")}
                    </td>
                    <td className="admin-td text-gray-300 tabular-nums">{imp.lineCount}</td>
                    <td className="admin-td text-white font-semibold tabular-nums">{imp.totalQuantity}</td>
                    <td className="admin-td">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                          imp.status === "RECEIVED"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-yellow-500/15 text-yellow-300"
                        }`}
                      >
                        {imp.status === "RECEIVED" ? "Réceptionnée" : "Brouillon"}
                      </span>
                    </td>
                    <td className="admin-td text-right">
                      <Link
                        href={`/admin/importations/${imp.id}`}
                        className="text-xs font-medium text-purple-300 hover:text-purple-200 transition-colors"
                      >
                        {imp.status === "DRAFT" ? "Continuer" : "Détails"}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-6">
            <h2 className="text-lg font-bold text-white mb-1">Nouvelle importation</h2>
            <p className="text-sm text-gray-400 mb-5">
              La référence sera générée automatiquement. Vous ajouterez les produits à l&apos;étape suivante.
            </p>

            <div className="space-y-4">
              <div>
                <label className="admin-label">Fournisseur</label>
                <input
                  type="text"
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">N° de facture (optionnel)</label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  className="admin-input"
                  placeholder="FAC-2026-..."
                />
              </div>
              <div>
                <label className="admin-label">Date d&apos;arrivée</label>
                <input
                  type="date"
                  value={form.arrivalDate}
                  onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
                  className="admin-input [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="admin-label">Note (optionnel)</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  className="admin-input resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-white/15 text-gray-300 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button onClick={handleCreate} disabled={creating} className="btn-primary flex-1 px-4 py-2.5 text-sm">
                {creating ? "Création..." : "Créer et continuer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
