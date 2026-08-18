"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ProductOption {
  id: string;
  nameFr: string;
  reference: string | null;
  trackSerial: boolean;
  stock: number;
  thumbnail: string | null;
}

interface Line {
  productId: string;
  quantity: number;
  serialsText: string; // textarea content, one SN per line
}

interface ImportationData {
  id: string;
  reference: string;
  supplier: string;
  invoiceNumber: string | null;
  arrivalDate: string;
  note: string | null;
  status: "DRAFT" | "RECEIVED";
  items: {
    id: string;
    quantity: number;
    serialsDraft: string[];
    product: { id: string; nameFr: string; reference: string | null; thumbnail: string | null; trackSerial: boolean; stock: number };
    units: { id: string; serialNumber: string; status: string }[];
  }[];
}

function parseSerials(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminImportationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [imp, setImp] = useState<ImportationData | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [header, setHeader] = useState({ supplier: "", invoiceNumber: "", arrivalDate: "", note: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [impRes, prodRes] = await Promise.all([
        fetch(`/api/admin/importations/${id}`),
        fetch("/api/admin/stock"),
      ]);
      if (impRes.ok) {
        const data: ImportationData = await impRes.json();
        setImp(data);
        setHeader({
          supplier: data.supplier,
          invoiceNumber: data.invoiceNumber || "",
          arrivalDate: data.arrivalDate?.slice(0, 10) || "",
          note: data.note || "",
        });
        setLines(
          data.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            serialsText: item.serialsDraft.join("\n"),
          }))
        );
      }
      if (prodRes.ok) {
        const prods = await prodRes.json();
        setProducts(
          prods.map((p: ProductOption & { category?: unknown }) => ({
            id: p.id, nameFr: p.nameFr, reference: p.reference,
            trackSerial: p.trackSerial, stock: p.stock, thumbnail: p.thumbnail,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const productById = (pid: string) => products.find((p) => p.id === pid);

  function addLine() {
    setLines([...lines, { productId: "", quantity: 1, serialsText: "" }]);
  }

  function updateLine(index: number, patch: Partial<Line>) {
    setLines(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function removeLine(index: number) {
    setLines(lines.filter((_, i) => i !== index));
  }

  async function saveDraft(silent = false): Promise<boolean> {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/importations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...header,
          items: lines
            .filter((l) => l.productId && l.quantity > 0)
            .map((l) => ({
              productId: l.productId,
              quantity: l.quantity,
              serials: parseSerials(l.serialsText),
            })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Erreur lors de l'enregistrement.");
        return false;
      }
      if (!silent) {
        setFlash("Brouillon enregistré.");
        setTimeout(() => setFlash(""), 3000);
      }
      return true;
    } catch {
      setError("Erreur réseau.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function receive() {
    // Client-side pre-check for clearer feedback
    for (const l of lines) {
      const p = productById(l.productId);
      if (!p) continue;
      if (p.trackSerial) {
        const count = parseSerials(l.serialsText).length;
        if (count !== l.quantity) {
          setError(`"${p.nameFr}" : ${count} N° de série saisi(s) pour ${l.quantity} unité(s).`);
          return;
        }
      }
    }
    if (!confirm("Réceptionner cette importation ? Le stock sera mis à jour et les N° de série enregistrés. Cette action est définitive.")) {
      return;
    }
    // Persist the draft first so the server validates exactly what is on screen
    const saved = await saveDraft(true);
    if (!saved) return;

    setReceiving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/importations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "receive" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Erreur lors de la réception.");
        return;
      }
      setImp(data);
      setFlash("Importation réceptionnée — stock mis à jour.");
      setTimeout(() => setFlash(""), 4000);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setReceiving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce brouillon d'importation ?")) return;
    const res = await fetch(`/api/admin/importations/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/importations");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Suppression impossible.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!imp) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Importation introuvable.</p>
        <Link href="/admin/importations" className="text-gray-900 hover:text-gray-600 text-sm font-medium">
          Retour aux importations
        </Link>
      </div>
    );
  }

  const isDraft = imp.status === "DRAFT";
  const totalQty = lines.reduce((s, l) => s + (l.quantity || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/importations" className="text-gray-500 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">{imp.reference}</h1>
            <span
              className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                isDraft ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {isDraft ? "Brouillon" : "Réceptionnée"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isDraft
              ? "Ajoutez les produits reçus, saisissez les N° de série, puis réceptionnez."
              : "Importation réceptionnée — lecture seule."}
          </p>
        </div>

        {isDraft && (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 text-sm font-medium bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={() => saveDraft()}
              disabled={saving}
              className="px-4 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer le brouillon"}
            </button>
            <button onClick={receive} disabled={receiving || lines.length === 0} className="btn-primary px-4 py-2.5 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {receiving ? "Réception..." : "Réceptionner"}
            </button>
          </div>
        )}
      </div>

      {flash && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-5">
          {flash}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
          {error}
        </div>
      )}

      {/* Importation header info */}
      <div className="admin-card p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Informations</h2>
        {isDraft ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="admin-label">Fournisseur</label>
              <input type="text" value={header.supplier} onChange={(e) => setHeader({ ...header, supplier: e.target.value })} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">N° de facture</label>
              <input type="text" value={header.invoiceNumber} onChange={(e) => setHeader({ ...header, invoiceNumber: e.target.value })} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Date d&apos;arrivée</label>
              <input type="date" value={header.arrivalDate} onChange={(e) => setHeader({ ...header, arrivalDate: e.target.value })} className="admin-input [color-scheme:light]" />
            </div>
            <div>
              <label className="admin-label">Note</label>
              <input type="text" value={header.note} onChange={(e) => setHeader({ ...header, note: e.target.value })} className="admin-input" />
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Fournisseur</p><p className="text-gray-900 font-medium">{imp.supplier}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">N° de facture</p><p className="text-gray-900 font-medium">{imp.invoiceNumber || "—"}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Date d&apos;arrivée</p><p className="text-gray-900 font-medium">{new Date(imp.arrivalDate).toLocaleDateString("fr-TN")}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Note</p><p className="text-gray-900 font-medium">{imp.note || "—"}</p></div>
          </div>
        )}
      </div>

      {/* Lines */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Produits ({lines.length} ligne{lines.length !== 1 ? "s" : ""} · {totalQty} unité{totalQty !== 1 ? "s" : ""})
          </h2>
          {isDraft && (
            <button
              onClick={addLine}
              className="px-3.5 py-2 text-xs font-semibold border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              + Ajouter une ligne
            </button>
          )}
        </div>

        {isDraft ? (
          lines.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 text-sm">Aucune ligne. Ajoutez les produits reçus dans cette importation.</p>
              <p className="text-gray-500 text-xs mt-1.5">
                Produit déjà au catalogue ? Sélectionnez-le. Nouveau modèle ?{" "}
                <Link href="/admin/products" className="text-gray-900 underline hover:text-gray-600">Créez-le d&apos;abord ici</Link>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lines.map((line, i) => {
                const product = productById(line.productId);
                const serialCount = parseSerials(line.serialsText).length;
                const serialMismatch = product?.trackSerial && serialCount !== line.quantity;
                return (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <div className="grid lg:grid-cols-12 gap-4">
                      {/* Product select */}
                      <div className="lg:col-span-5">
                        <label className="admin-label">Produit</label>
                        <select
                          value={line.productId}
                          onChange={(e) => updateLine(i, { productId: e.target.value })}
                          className="admin-input"
                        >
                          <option value="">— Sélectionner un produit —</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nameFr} {p.reference ? `(${p.reference})` : ""} {p.trackSerial ? "· SN" : "· sans SN"}
                            </option>
                          ))}
                        </select>
                        {product && (
                          <p className="text-xs text-gray-500 mt-1.5">
                            Stock actuel : <span className="text-gray-700 tabular-nums">{product.stock}</span>
                            {" · "}
                            {product.trackSerial ? (
                              <span className="text-gray-900">Suivi par N° de série</span>
                            ) : (
                              <span className="text-gray-500">Quantité seule (accessoire)</span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="lg:col-span-2">
                        <label className="admin-label">Quantité</label>
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) => updateLine(i, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                          className="admin-input tabular-nums"
                        />
                      </div>

                      {/* Serials */}
                      <div className="lg:col-span-4">
                        {product?.trackSerial ? (
                          <>
                            <label className="admin-label">
                              N° de série{" "}
                              <span className={serialMismatch ? "text-amber-600" : "text-emerald-600"}>
                                ({serialCount}/{line.quantity})
                              </span>
                            </label>
                            <textarea
                              value={line.serialsText}
                              onChange={(e) => updateLine(i, { serialsText: e.target.value })}
                              rows={3}
                              placeholder={"Un N° de série par ligne :\nSN-001\nSN-002"}
                              className={`admin-input resize-y font-mono text-xs ${serialMismatch ? "border-amber-400" : ""}`}
                            />
                          </>
                        ) : product ? (
                          <div className="h-full flex items-end pb-2">
                            <p className="text-xs text-gray-500 italic">
                              Pas de N° de série requis pour ce produit.
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {/* Remove */}
                      <div className="lg:col-span-1 flex lg:items-start lg:justify-end">
                        <button
                          onClick={() => removeLine(i)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Retirer la ligne"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Received: read-only lines with units */
          <div className="space-y-4">
            {imp.items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                    {item.product.thumbnail && (
                      <Image src={item.product.thumbnail} alt="" width={40} height={40} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.product.nameFr}</p>
                    <p className="text-xs text-gray-500 font-mono">{item.product.reference}</p>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold tabular-nums shrink-0">
                    +{item.quantity}
                  </span>
                </div>
                {item.units.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.units.map((u) => (
                      <span
                        key={u.id}
                        className={`px-2 py-0.5 text-[11px] font-mono rounded-md border ${
                          u.status === "IN_STOCK"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : u.status === "SOLD"
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                        title={u.status === "IN_STOCK" ? "En stock" : u.status === "SOLD" ? "Vendu" : u.status}
                      >
                        {u.serialNumber}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
