"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface CategoryTree {
  id: string; nameFr: string; nameEn: string; slug: string; image: string | null;
  _count: { products: number };
  families: {
    id: string; nameFr: string; nameEn: string; slug: string;
    _count: { products: number };
    subfamilies: {
      id: string; nameFr: string; nameEn: string; slug: string;
      _count: { products: number };
    }[];
  }[];
}

interface Product {
  id: string; nameFr: string; nameEn: string; slug: string; reference: string | null;
  descriptionFr: string | null; descriptionEn: string | null;
  thumbnail: string | null; isFeatured: boolean;
  priceTTC?: number;
  category: { nameFr: string; nameEn: string; slug: string };
  family: { nameFr: string; nameEn: string; slug: string } | null;
  subfamily: { nameFr: string; nameEn: string; slug: string } | null;
}

export default function ProductsPage() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [activeCat, setActiveCat] = useState("");
  const [activeFam, setActiveFam] = useState("");
  const [activeSf, setActiveSf] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCat) params.set("category", activeCat);
    if (activeFam) params.set("family", activeFam);
    if (activeSf) params.set("subfamily", activeSf);
    if (searchDebounced) params.set("search", searchDebounced);
    params.set("page", String(page));
    params.set("limit", "24");

    const res = await fetch(`/api/products?${params}`);
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
      setIsAuthenticated(data.isAuthenticated);
    }
    setLoading(false);
  }, [activeCat, activeFam, activeSf, searchDebounced, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [activeCat, activeFam, activeSf, searchDebounced]);

  function selectCategory(slug: string) {
    setActiveCat(slug === activeCat ? "" : slug);
    setActiveFam(""); setActiveSf("");
    setExpandedCats((prev) => { const s = new Set(prev); s.has(slug) ? s.delete(slug) : s.add(slug); return s; });
  }
  function selectFamily(slug: string) {
    setActiveFam(slug === activeFam ? "" : slug);
    setActiveSf("");
  }
  function selectSubfamily(slug: string) {
    setActiveSf(slug === activeSf ? "" : slug);
  }

  const getName = (item: { nameFr: string; nameEn: string }) =>
    language === "en" ? item.nameEn || item.nameFr : item.nameFr;

  const activeFilterCount = [activeCat, activeFam, activeSf].filter(Boolean).length;

  const searchInput = (extraClass = "") => (
    <div className={`relative ${extraClass}`}>
      <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={language === "fr" ? "Rechercher un produit..." : "Search a product..."}
        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all"
      />
    </div>
  );

  function renderCategoryTree() {
    return (
      <>
        <div className="bg-white/[0.04] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {language === "fr" ? "Catégories" : "Categories"}
            </h3>
          </div>
          <nav className="p-2">
            <button
              onClick={() => { setActiveCat(""); setActiveFam(""); setActiveSf(""); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !activeCat ? "bg-purple-500/15 text-purple-300" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {language === "fr" ? "Tous les produits" : "All products"}
              <span className="text-gray-500 ml-1 text-xs">({total})</span>
            </button>

            {categories.map((cat) => {
              const isActive = activeCat === cat.slug;
              const isExpanded = expandedCats.has(cat.slug) || isActive;

              return (
                <div key={cat.id}>
                  <button
                    onClick={() => selectCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                      isActive && !activeFam ? "bg-purple-500/15 text-purple-300" : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{getName(cat)}</span>
                    {cat.families.length > 0 && (
                      <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  {isExpanded && cat.families.length > 0 && (
                    <div className="ml-3 border-l-2 border-white/10 pl-2">
                      {cat.families.map((fam) => (
                        <div key={fam.id}>
                          <button
                            onClick={() => { if (activeCat !== cat.slug) setActiveCat(cat.slug); selectFamily(fam.slug); }}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              activeFam === fam.slug && !activeSf ? "bg-purple-500/15 text-purple-300" : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {getName(fam)}
                            <span className="text-gray-600 ml-1">({fam._count.products})</span>
                          </button>

                          {activeFam === fam.slug && fam.subfamilies.length > 0 && (
                            <div className="ml-3 border-l border-white/10 pl-2">
                              {fam.subfamilies.map((sf) => (
                                <button
                                  key={sf.id}
                                  onClick={() => selectSubfamily(sf.slug)}
                                  className={`w-full text-left px-3 py-1 rounded-md text-xs transition-colors ${
                                    activeSf === sf.slug ? "bg-purple-500/15 text-purple-300 font-medium" : "text-gray-500 hover:bg-white/5 hover:text-white"
                                  }`}
                                >
                                  {getName(sf)}
                                  <span className="text-gray-600 ml-1">({sf._count.products})</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Guest CTA */}
        {!isAuthenticated && (
          <div className="mt-5 bg-purple-500/10 border border-purple-400/20 rounded-2xl p-5">
            <p className="text-sm text-white font-semibold mb-1.5">
              {language === "fr" ? "Vous êtes professionnel ?" : "Are you a professional?"}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              {language === "fr"
                ? "Connectez-vous pour voir les prix et passer commande."
                : "Sign in to see prices and place orders."}
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/signin" className="btn-primary px-4 py-2 text-xs">
                {language === "fr" ? "Se connecter" : "Sign in"}
              </Link>
              <Link href="/contact" className="btn-outline-light px-4 py-2 text-xs">
                {language === "fr" ? "Nous contacter" : "Contact us"}
              </Link>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-950">
        {/* Page hero */}
        <div className="relative bg-gray-900 border-b border-white/10 overflow-hidden">
          <div className="absolute -top-24 right-1/4 w-[420px] h-[420px] bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 bg-purple-500/10 border border-purple-400/20 rounded-full px-4 py-1.5 mb-4">
              {language === "fr" ? "Gamme Yuwell" : "Yuwell range"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
              {t.products.title}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">{t.products.subtitle}</p>
          </div>
        </div>

        {/* Mobile filter drawer overlay */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setFilterOpen(false)}
            />
            {/* Sliding panel */}
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-gray-950 border-r border-white/10 shadow-2xl flex flex-col">
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <h2 className="text-base font-semibold text-white">
                  {language === "fr" ? "Filtres" : "Filters"}
                </h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label={language === "fr" ? "Fermer" : "Close"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto p-4">
                {renderCategoryTree()}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex gap-8">
            {/* Sidebar: Category tree (desktop) */}
            <aside className="w-64 shrink-0 hidden lg:block">
              {searchInput("mb-5")}
              {renderCategoryTree()}
            </aside>

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {/* Mobile search + filter button */}
              <div className="lg:hidden mb-4 flex items-center gap-2">
                {searchInput("flex-1")}
                <button
                  onClick={() => setFilterOpen(true)}
                  className="btn-primary relative px-3.5 py-2.5 text-sm shrink-0 rounded-xl"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {language === "fr" ? "Filtres" : "Filters"}
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-purple-700 text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
                <Link href="/" className="hover:text-purple-300 transition-colors">{t.nav.home}</Link>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className={activeCat ? "hover:text-purple-300 cursor-pointer transition-colors" : "text-white font-medium"} onClick={() => { setActiveCat(""); setActiveFam(""); setActiveSf(""); }}>
                  {t.nav.products}
                </span>
                {activeCat && (() => {
                  const cat = categories.find((c) => c.slug === activeCat);
                  if (!cat) return null;
                  return (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      <span className={activeFam ? "hover:text-purple-300 cursor-pointer transition-colors" : "text-white font-medium"} onClick={() => { setActiveFam(""); setActiveSf(""); }}>
                        {getName(cat)}
                      </span>
                      {activeFam && (() => {
                        const fam = cat.families.find((f) => f.slug === activeFam);
                        if (!fam) return null;
                        return (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            <span className={activeSf ? "hover:text-purple-300 cursor-pointer transition-colors" : "text-white font-medium"} onClick={() => setActiveSf("")}>
                              {getName(fam)}
                            </span>
                            {activeSf && (() => {
                              const sf = fam.subfamilies.find((s) => s.slug === activeSf);
                              if (!sf) return null;
                              return (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                  <span className="text-white font-medium">{getName(sf)}</span>
                                </>
                              );
                            })()}
                          </>
                        );
                      })()}
                    </>
                  );
                })()}
              </div>

              {/* Results info */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-400">
                  <span className="text-white font-semibold">{total}</span>{" "}
                  {language === "fr" ? "produit" : "product"}{total !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white/[0.04] rounded-2xl border border-white/10 overflow-hidden animate-pulse">
                      <div className="h-52 bg-white/10" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.03] rounded-2xl border border-white/10">
                  <svg className="w-14 h-14 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-gray-400">
                    {language === "fr" ? "Aucun produit trouvé." : "No products found."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.slug}`}
                        className="group bg-white/[0.04] rounded-2xl border border-white/10 hover:border-purple-400/50 hover:bg-white/[0.07] shadow-lg shadow-black/30 hover:shadow-purple-900/20 overflow-hidden transition-all duration-300 flex flex-col"
                      >
                        {/* Image */}
                        <div className="relative h-52 bg-white overflow-hidden">
                          {p.thumbnail ? (
                            <Image
                              src={p.thumbnail}
                              alt={getName(p)}
                              fill
                              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {p.reference && (
                            <span className="absolute top-3 left-3 bg-gray-950/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide">
                              {p.reference}
                            </span>
                          )}
                          {p.isFeatured && (
                            <span className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                              {language === "fr" ? "Vedette" : "Featured"}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-300 mb-1.5">
                            <span>{getName(p.category)}</span>
                            {p.family && (
                              <>
                                <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                <span>{getName(p.family)}</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-[15px] font-bold text-white leading-snug mb-1 group-hover:text-purple-200 transition-colors line-clamp-2">
                            {getName(p)}
                          </h3>

                          {/* Price or CTA */}
                          <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
                            {isAuthenticated && p.priceTTC !== undefined ? (
                              <p className="text-lg font-bold text-purple-300 tabular-nums">
                                {p.priceTTC.toFixed(2)} <span className="text-xs font-normal text-gray-500">TND TTC</span>
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500">
                                {language === "fr" ? "Connectez-vous pour voir le prix" : "Sign in to see price"}
                              </p>
                            )}
                            <svg className="w-4 h-4 text-gray-600 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3.5 py-2 text-sm text-gray-300 border border-white/15 rounded-xl hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {language === "fr" ? "Précédent" : "Previous"}
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => (
                          <span key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-600">...</span>}
                            <button
                              onClick={() => setPage(p)}
                              className={`w-9 h-9 text-sm rounded-xl font-medium transition-colors ${
                                p === page
                                  ? "bg-gradient-to-b from-purple-600 to-purple-700 text-white shadow-sm shadow-purple-900/25"
                                  : "border border-white/15 text-gray-300 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              {p}
                            </button>
                          </span>
                        ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3.5 py-2 text-sm text-gray-300 border border-white/15 rounded-xl hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {language === "fr" ? "Suivant" : "Next"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
