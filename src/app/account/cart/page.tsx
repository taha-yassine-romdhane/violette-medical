"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string; nameFr: string; nameEn: string; slug: string;
    thumbnail: string | null; isActive: boolean;
  } | null;
  pack: {
    id: string; nameFr: string; nameEn: string; slug: string;
    image: string | null; isActive: boolean;
  } | null;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [ordering, setOrdering] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderId: string } | null>(null);
  const [orderError, setOrderError] = useState("");

  const fetchCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setItems(data.cart.items);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function updateQuantity(itemId: string, quantity: number) {
    setUpdating((prev) => new Set(prev).add(itemId));
    await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    await fetchCart();
    setUpdating((prev) => { const s = new Set(prev); s.delete(itemId); return s; });
  }

  async function removeItem(itemId: string) {
    setUpdating((prev) => new Set(prev).add(itemId));
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    await fetchCart();
    setUpdating((prev) => { const s = new Set(prev); s.delete(itemId); return s; });
  }

  async function handleConfirmOrder() {
    setOrdering(true);
    setOrderError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erreur lors de l'envoi de la demande.");
      }
      const data = await res.json();
      setOrderSuccess({ orderNumber: data.orderNumber, orderId: data.order.id });
      setShowConfirm(false);
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : "Erreur lors de l'envoi de la demande.");
    } finally {
      setOrdering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Demande de devis envoyée !</h1>
        <p className="text-gray-500 mb-1 text-center max-w-md">
          Votre demande a bien été enregistrée. Un commercial vous transmettra votre devis dans les plus brefs délais.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          N° <span className="font-semibold text-purple-700">{orderSuccess.orderNumber}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/account/orders/${orderSuccess.orderId}`}
            className="px-6 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition-colors text-center"
          >
            Suivre ma demande
          </Link>
          <Link
            href="/products"
            className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            Continuer à parcourir
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ma demande de devis</h1>
        <p className="text-sm text-gray-400 mt-1">{items.length} article{items.length !== 1 ? "s" : ""}</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <svg className="w-14 h-14 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mb-4">Votre demande est vide.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition-colors">
            Voir les produits
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Items list */}
          <div className="flex-1 space-y-2 pb-44 sm:pb-0">
            {items.map((item) => {
              const entity = item.product || item.pack;
              if (!entity) return null;
              const name = entity.nameFr;
              const thumb = "thumbnail" in entity ? entity.thumbnail : "image" in entity ? entity.image : null;
              const slug = item.product?.slug;
              const isUpdating = updating.has(item.id);

              return (
                <div key={item.id} className={`bg-white rounded-xl border border-gray-100 p-4 transition-opacity ${isUpdating ? "opacity-50" : ""}`}>
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-14 sm:h-14 bg-white rounded-xl overflow-hidden shrink-0 relative border border-gray-100">
                      {thumb ? (
                        <Image src={thumb} alt={name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {slug ? (
                        <Link href={`/products/${slug}`} className="text-sm font-semibold text-gray-900 hover:text-purple-700 line-clamp-2 transition-colors">{name}</Link>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">{name}</p>
                      )}
                      <p className="text-xs text-purple-600 font-medium mt-0.5">Sur devis</p>
                    </div>

                    {/* Remove - desktop */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isUpdating}
                      className="hidden sm:block p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all disabled:opacity-40"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>

                  {/* Qty row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Quantité</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                          disabled={isUpdating}
                          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 text-sm font-medium transition-colors"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-900 tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 text-sm font-medium transition-colors"
                        >
                          +
                        </button>
                      </div>
                      {/* Remove - mobile */}
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isUpdating}
                        className="sm:hidden p-2 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all disabled:opacity-40"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quote summary - sticky on mobile, static sidebar on desktop */}
          <div className="fixed bottom-0 left-0 right-0 sm:static sm:w-80 lg:w-72 lg:shrink-0 z-30">
            <div className="bg-white sm:rounded-2xl border-t sm:border border-gray-100 p-5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:shadow-none sm:sticky sm:top-8">
              <div className="hidden sm:block mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Résumé</h3>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{items.length} article{items.length !== 1 ? "s" : ""}</span>
                <span className="text-sm font-semibold text-purple-700">Sur devis</span>
              </div>

              <div className="hidden sm:block bg-purple-50 border border-purple-100 rounded-xl p-3 mb-4">
                <p className="text-xs text-purple-800 leading-relaxed">
                  Les tarifs professionnels vous seront communiqués dans votre devis après validation par notre équipe.
                </p>
              </div>

              {orderError && (
                <div className="my-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                  {orderError}
                </div>
              )}

              <div className="flex sm:flex-col gap-2 mt-1 sm:mt-0">
                <button
                  onClick={() => setShowConfirm(true)}
                  className="btn-primary flex-1 sm:w-full py-3 text-sm"
                >
                  Demander mon devis
                </button>
                <Link
                  href="/products"
                  className="hidden sm:block text-center py-2.5 text-sm text-gray-500 hover:text-purple-700 transition-colors"
                >
                  Continuer à parcourir
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !ordering && setShowConfirm(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-6 sm:mx-4">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Envoyer la demande de devis</h2>
              <p className="text-sm text-gray-500 mt-1">
                {items.length} article{items.length !== 1 ? "s" : ""} — un commercial vous répondra avec vos tarifs.
              </p>
            </div>

            {orderError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                {orderError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setOrderError(""); }}
                disabled={ordering}
                className="flex-1 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={ordering}
                className="flex-1 py-3 text-sm font-semibold text-white bg-purple-700 rounded-xl hover:bg-purple-800 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {ordering && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {ordering ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
