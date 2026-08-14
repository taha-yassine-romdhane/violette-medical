"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Product {
  id: string; nameFr: string; nameEn: string; slug: string; reference: string | null;
  descriptionFr: string | null; descriptionEn: string | null;
  images: string[]; thumbnail: string | null; isFeatured: boolean;
  priceHT?: number; taxRate?: number; priceTTC?: number; stock?: number;
  category: { nameFr: string; nameEn: string; slug: string };
  family: { nameFr: string; nameEn: string; slug: string } | null;
  subfamily: { nameFr: string; nameEn: string; slug: string } | null;
}

interface RelatedProduct {
  id: string; nameFr: string; nameEn: string; slug: string; thumbnail: string | null;
  priceTTC?: number;
  category: { nameFr: string; nameEn: string; slug: string };
}

export default function ProductDetailPage() {
  const { language, t } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canSeePrices, setCanSeePrices] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState("");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const priceSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = priceSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setProduct(data.product);
        setRelated(data.related);
        setIsAuthenticated(data.isAuthenticated);
        setCanSeePrices(!!data.canSeePrices);
        setActiveImage(0);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  const getName = (item: { nameFr: string; nameEn: string }) =>
    language === "en" ? item.nameEn || item.nameFr : item.nameFr;

  const getDesc = (p: Product) =>
    language === "en" ? p.descriptionEn || p.descriptionFr : p.descriptionFr;

  async function addToCart(productId: string) {
    setAdding(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty }),
    });
    setAdding(false);
    if (res.ok) {
      setAddedMsg(
        canSeePrices
          ? (language === "fr" ? "Ajouté au panier !" : "Added to cart!")
          : (language === "fr" ? "Ajouté à votre demande !" : "Added to your request!")
      );
      setTimeout(() => setAddedMsg(""), 3000);
      setQty(1);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="animate-pulse grid lg:grid-cols-2 gap-10">
              <div className="aspect-square bg-gray-100 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-6 bg-gray-100 rounded w-1/3" />
                <div className="h-8 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !product) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {language === "fr" ? "Produit non trouvé" : "Product not found"}
            </h1>
            <Link href="/products" className="text-purple-700 hover:text-purple-900 text-sm font-medium transition-colors">
              {language === "fr" ? "Retour aux produits" : "Back to products"}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = product.images.length > 0 ? product.images : (product.thumbnail ? [product.thumbnail] : []);

  const qtyStepper = (small = false) => (
    <div className="flex items-center border border-gray-200 rounded-xl bg-white">
      <button
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className={`${small ? "w-8 h-8 text-sm" : "w-9 h-9"} flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-l-xl transition-colors`}
      >
        -
      </button>
      <span className={`${small ? "w-8" : "w-10"} text-center text-sm font-semibold text-gray-900 tabular-nums`}>{qty}</span>
      <button
        onClick={() => setQty((q) => q + 1)}
        className={`${small ? "w-8 h-8 text-sm" : "w-9 h-9"} flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-xl transition-colors`}
      >
        +
      </button>
    </div>
  );

  return (
    <>
      <Header />
      <main className={`pt-20 min-h-screen bg-white ${showStickyBar && canSeePrices && product.priceTTC !== undefined && product.stock !== undefined && product.stock > 0 ? "pb-20 md:pb-0" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-6 flex-wrap">
            <Link href="/" className="hover:text-purple-700 transition-colors">{t.nav.home}</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            <Link href="/products" className="hover:text-purple-700 transition-colors">{t.nav.products}</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            <Link href="/products" className="hover:text-purple-700 transition-colors">{getName(product.category)}</Link>
            {product.family && (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="text-gray-900 font-medium">{getName(product.family)}</span>
              </>
            )}
          </div>

          {/* Product detail */}
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Image gallery */}
            <div>
              <div className="relative aspect-square bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3 shadow-sm">
                {images.length > 0 ? (
                  <Image
                    src={images[activeImage]}
                    alt={getName(product)}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {product.isFeatured && (
                  <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {language === "fr" ? "Produit vedette" : "Featured product"}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden bg-white transition-colors ${
                        idx === activeImage ? "border-purple-500" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-purple-600 mb-3 flex-wrap">
                <span>{getName(product.category)}</span>
                {product.family && (
                  <>
                    <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span>{getName(product.family)}</span>
                  </>
                )}
                {product.subfamily && (
                  <>
                    <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span>{getName(product.subfamily)}</span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
                {getName(product)}
              </h1>

              {product.reference && (
                <p className="text-sm text-gray-400 font-mono mb-5">REF: {product.reference}</p>
              )}

              {/* Quote / pricing section */}
              <div ref={priceSectionRef} className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6">
                {canSeePrices && product.priceTTC !== undefined ? (
                  /* Owner / sales view — real pricing + add to cart */
                  <div>
                    <p className="text-3xl font-bold text-purple-700 mb-1 tabular-nums">
                      {product.priceTTC.toFixed(2)} <span className="text-base font-normal text-gray-500">TND TTC</span>
                    </p>
                    {product.priceHT !== undefined && (
                      <p className="text-sm text-gray-500">
                        {product.priceHT.toFixed(2)} TND HT &middot; TVA {product.taxRate}%
                      </p>
                    )}
                    {product.stock !== undefined && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span className={`text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {product.stock > 0
                            ? (language === "fr" ? "En stock" : "In stock")
                            : (language === "fr" ? "Rupture de stock" : "Out of stock")}
                        </span>
                      </div>
                    )}
                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        {qtyStepper()}
                        <button onClick={() => addToCart(product.id)} disabled={adding} className="btn-primary flex-1 px-5 py-2.5 text-sm">
                          {adding ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                          )}
                          {language === "fr" ? "Ajouter au panier" : "Add to cart"}
                        </button>
                      </div>
                      {addedMsg && (
                        <p className="text-sm text-emerald-600 font-medium mt-3 flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          {addedMsg}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Storefront view — quote-based, no prices */
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {language === "fr" ? "Prix sur devis" : "Price on quote"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === "fr"
                            ? "Nos tarifs professionnels sont établis sur demande."
                            : "Our professional pricing is provided on request."}
                        </p>
                      </div>
                    </div>

                    {isAuthenticated ? (
                      /* Logged-in client — build a quote request */
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                          {qtyStepper()}
                          <button onClick={() => addToCart(product.id)} disabled={adding} className="btn-primary flex-1 px-5 py-2.5 text-sm">
                            {adding ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            )}
                            {language === "fr" ? "Ajouter à ma demande" : "Add to request"}
                          </button>
                        </div>
                        {addedMsg && (
                          <p className="text-sm text-emerald-600 font-medium mt-3 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            {addedMsg}
                          </p>
                        )}
                        <Link href="/account/cart" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                          {language === "fr" ? "Voir ma demande de devis" : "View my quote request"}
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                      </div>
                    ) : (
                      /* Guest */
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <Link href="/contact" className="btn-primary flex-1 px-4 py-2.5 text-sm">
                          {language === "fr" ? "Demander un devis" : "Request a quote"}
                        </Link>
                        <Link href="/signin" className="btn-outline flex-1 px-4 py-2.5 text-sm">
                          {language === "fr" ? "Espace client" : "Client area"}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {getDesc(product) && (
                <div className="mb-8">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {language === "fr" ? "Description" : "Description"}
                  </h2>
                  <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {getDesc(product)}
                  </p>
                </div>
              )}

              {/* Back to products */}
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                {language === "fr" ? "Tous les produits" : "All products"}
              </Link>
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {language === "fr" ? "Produits similaires" : "Related products"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/products/${r.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 overflow-hidden transition-all duration-300"
                  >
                    <div className="relative h-36 bg-white">
                      {r.thumbnail ? (
                        <Image src={r.thumbnail} alt={getName(r)} fill className="object-cover group-hover:scale-[1.04] transition-transform duration-500" sizes="25vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3.5">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2">{getName(r)}</p>
                      {canSeePrices && r.priceTTC !== undefined && (
                        <p className="text-sm font-bold text-purple-700 mt-1 tabular-nums">{r.priceTTC.toFixed(2)} TND</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile sticky add-to-cart bar */}
      {canSeePrices && product.priceTTC !== undefined && product.stock !== undefined && product.stock > 0 && showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-purple-700 shrink-0 tabular-nums">
              {product.priceTTC.toFixed(2)} <span className="text-xs font-normal text-gray-500">TND</span>
            </p>
            {qtyStepper(true)}
            <button
              onClick={() => addToCart(product.id)}
              disabled={adding}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              {adding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
              )}
              {language === "fr" ? "Ajouter" : "Add"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
