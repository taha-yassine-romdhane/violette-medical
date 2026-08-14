"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";

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

  // Lock page scroll behind the mobile filter sheet
  useEffect(() => {
    document.body.style.overflow = filterOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

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
      <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={language === "fr" ? "Rechercher un produit..." : "Search a product..."}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 focus:bg-white transition-all"
      />
    </div>
  );

  function renderCategoryTree() {
    return (
      <>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {language === "fr" ? "Catégories" : "Categories"}
            </h3>
          </div>
          <nav className="p-2">
            <button
              onClick={() => { setActiveCat(""); setActiveFam(""); setActiveSf(""); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !activeCat ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {language === "fr" ? "Tous les produits" : "All products"}
              <span className="text-gray-400 ml-1 text-xs">({total})</span>
            </button>

            {categories.map((cat) => {
              const isActive = activeCat === cat.slug;
              const isExpanded = expandedCats.has(cat.slug) || isActive;

              return (
                <div key={cat.id}>
                  <button
                    onClick={() => selectCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                      isActive && !activeFam ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>{getName(cat)}</span>
                    {cat.families.length > 0 && (
                      <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  {isExpanded && cat.families.length > 0 && (
                    <div className="ml-3 border-l-2 border-gray-100 pl-2">
                      {cat.families.map((fam) => (
                        <div key={fam.id}>
                          <button
                            onClick={() => { if (activeCat !== cat.slug) setActiveCat(cat.slug); selectFamily(fam.slug); }}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              activeFam === fam.slug && !activeSf ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            {getName(fam)}
                            <span className="text-gray-400 ml-1">({fam._count.products})</span>
                          </button>

                          {activeFam === fam.slug && fam.subfamilies.length > 0 && (
                            <div className="ml-3 border-l border-gray-100 pl-2">
                              {fam.subfamilies.map((sf) => (
                                <button
                                  key={sf.id}
                                  onClick={() => selectSubfamily(sf.slug)}
                                  className={`w-full text-left px-3 py-1 rounded-md text-xs transition-colors ${
                                    activeSf === sf.slug ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                >
                                  {getName(sf)}
                                  <span className="text-gray-400 ml-1">({sf._count.products})</span>
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
          <div className="mt-5 bg-purple-50 border border-purple-100 rounded-2xl p-5">
            <p className="text-sm text-gray-900 font-semibold mb-1.5">
              {language === "fr" ? "Besoin d'un devis ?" : "Need a quote?"}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              {language === "fr"
                ? "Nos tarifs professionnels sont établis sur devis. Contactez-nous ou créez votre compte pour faire une demande."
                : "Our professional pricing is quote-based. Contact us or create an account to request one."}
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/contact" className="btn-primary px-4 py-2 text-xs">
                {language === "fr" ? "Demander un devis" : "Request a quote"}
              </Link>
              <Link href="/signin" className="btn-outline px-4 py-2 text-xs">
                {language === "fr" ? "Espace client" : "Client area"}
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
      <main className="pt-20 min-h-screen bg-white">
        {/* Page hero */}
        <div className="relative bg-white border-b border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none" />
          <div className="absolute -top-24 right-1/4 w-[420px] h-[420px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-12 lg:py-16">
            <Reveal>
              <div className="flex flex-row-reverse items-center justify-between gap-2 mb-1 sm:block sm:mb-0">
                <span className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0 rounded-full bg-purple-50 border border-purple-100 px-2.5 py-1 sm:rounded-none sm:bg-transparent sm:border-0 sm:px-0 sm:py-0 text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] sm:tracking-[0.2em] text-purple-700 sm:mb-4">
                  <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="hidden sm:block w-8 h-px bg-purple-300" />
                  {language === "fr" ? "Gamme Yuwell" : "Yuwell range"}
                </span>
                <h1 className="text-[22px] leading-tight sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 min-w-0 sm:mb-3">
                  {t.products.title}
                </h1>
              </div>
              <p className="text-gray-500 text-[13px] leading-snug sm:text-lg max-w-2xl line-clamp-2 sm:line-clamp-none">
                {t.products.subtitle}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Mobile filter bottom sheet — only mounted while open */}
        {filterOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm animate-backdrop-in"
            onClick={() => setFilterOpen(false)}
          />
          {/* Sheet sliding up from the bottom */}
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col animate-sheet-up"
            role="dialog"
            aria-modal="true"
            aria-label={language === "fr" ? "Filtres" : "Filters"}
          >
            {/* Grab handle */}
            <button
              onClick={() => setFilterOpen(false)}
              className="pt-3 pb-2 flex justify-center w-full shrink-0"
              aria-label={language === "fr" ? "Fermer" : "Close"}
            >
              <span className="w-10 h-1.5 rounded-full bg-gray-200" />
            </button>
            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-semibold text-gray-900">
                {language === "fr" ? "Filtres" : "Filters"}
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-purple-100 text-purple-700 text-[11px] font-bold rounded-full align-middle">
                    {activeFilterCount}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setFilterOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label={language === "fr" ? "Fermer" : "Close"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Sheet body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 bg-gray-50">
              {renderCategoryTree()}
            </div>
            {/* Sheet footer */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setActiveCat(""); setActiveFam(""); setActiveSf(""); }}
                  className="btn-outline px-4 py-2.5 text-sm rounded-xl shrink-0"
                >
                  {language === "fr" ? "Réinitialiser" : "Reset"}
                </button>
              )}
              <button
                onClick={() => setFilterOpen(false)}
                className="btn-primary flex-1 px-4 py-2.5 text-sm rounded-xl"
              >
                {language === "fr"
                  ? `Voir ${total} produit${total !== 1 ? "s" : ""}`
                  : `Show ${total} product${total !== 1 ? "s" : ""}`}
              </button>
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
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-purple-700 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-5 flex-wrap">
                <Link href="/" className="hover:text-purple-700 transition-colors">{t.nav.home}</Link>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className={activeCat ? "hover:text-purple-700 cursor-pointer transition-colors" : "text-gray-900 font-medium"} onClick={() => { setActiveCat(""); setActiveFam(""); setActiveSf(""); }}>
                  {t.nav.products}
                </span>
                {activeCat && (() => {
                  const cat = categories.find((c) => c.slug === activeCat);
                  if (!cat) return null;
                  return (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      <span className={activeFam ? "hover:text-purple-700 cursor-pointer transition-colors" : "text-gray-900 font-medium"} onClick={() => { setActiveFam(""); setActiveSf(""); }}>
                        {getName(cat)}
                      </span>
                      {activeFam && (() => {
                        const fam = cat.families.find((f) => f.slug === activeFam);
                        if (!fam) return null;
                        return (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            <span className={activeSf ? "hover:text-purple-700 cursor-pointer transition-colors" : "text-gray-900 font-medium"} onClick={() => setActiveSf("")}>
                              {getName(fam)}
                            </span>
                            {activeSf && (() => {
                              const sf = fam.subfamilies.find((s) => s.slug === activeSf);
                              if (!sf) return null;
                              return (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                  <span className="text-gray-900 font-medium">{getName(sf)}</span>
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
                <p className="text-sm text-gray-500">
                  <span className="text-gray-900 font-semibold">{total}</span>{" "}
                  {language === "fr" ? "produit" : "product"}{total !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                      <div className="h-36 sm:h-52 bg-gray-100" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-50 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/70 rounded-2xl border border-gray-100">
                  <svg className="w-14 h-14 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-gray-400">
                    {language === "fr" ? "Aucun produit trouvé." : "No products found."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                    {products.map((p, i) => (
                      <Reveal key={p.id} delay={(i % 3) * 60} className="h-full">
                        <Link
                          href={`/products/${p.slug}`}
                          className="group h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 overflow-hidden transition-all duration-300 flex flex-col"
                        >
                          {/* Image */}
                          <div className="relative h-36 sm:h-52 bg-white overflow-hidden">
                            {p.thumbnail ? (
                              <Image
                                src={p.thumbnail}
                                alt={getName(p)}
                                fill
                                className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                                sizes="(max-width: 1280px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            {p.reference && (
                              <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gray-950/80 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full tracking-wide">
                                {p.reference}
                              </span>
                            )}
                            {p.isFeatured && (
                              <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-purple-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wide">
                                {language === "fr" ? "Vedette" : "Featured"}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-3 sm:p-5 flex flex-col flex-1 border-t border-gray-50">
                            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-purple-600 mb-1 sm:mb-1.5 min-w-0">
                              <span className="truncate">{getName(p.category)}</span>
                              {p.family && (
                                <span className="hidden sm:flex items-center gap-1.5 min-w-0">
                                  <svg className="w-2.5 h-2.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                  <span className="truncate">{getName(p.family)}</span>
                                </span>
                              )}
                            </div>
                            <h3 className="text-[13px] sm:text-[15px] font-bold text-gray-900 leading-snug mb-1 group-hover:text-purple-700 transition-colors line-clamp-2">
                              {getName(p)}
                            </h3>

                            {/* Quote label + CTA (prices are never shown on the storefront) */}
                            <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-50 flex items-center justify-between">
                              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-purple-700">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {language === "fr" ? "Sur devis" : "On quote"}
                              </span>
                              <svg className="w-4 h-4 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      </Reveal>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3.5 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {language === "fr" ? "Précédent" : "Previous"}
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => (
                          <span key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-300">...</span>}
                            <button
                              onClick={() => setPage(p)}
                              className={`w-9 h-9 text-sm rounded-xl font-medium transition-colors ${
                                p === page
                                  ? "bg-gradient-to-b from-purple-600 to-purple-700 text-white shadow-sm shadow-purple-900/25"
                                  : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              {p}
                            </button>
                          </span>
                        ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3.5 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
