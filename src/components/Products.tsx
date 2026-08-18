"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

interface ApiProduct {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  reference: string | null;
  thumbnail: string | null;
  images: string[];
  family: { nameFr: string; nameEn: string; slug: string } | null;
}

export default function Products() {
  const { t, language } = useLanguage();
  const fr = language === "fr";
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products?featured=true&limit=8")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProducts(data?.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const getName = (p: ApiProduct) => (fr ? p.nameFr : p.nameEn || p.nameFr);
  const getFamily = (p: ApiProduct) =>
    p.family ? (fr ? p.family.nameFr : p.family.nameEn || p.family.nameFr) : null;

  function scrollRail(dir: 1 | -1) {
    railRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  const families = [
    {
      title: fr ? "Concentrateurs d'Oxygène" : "Oxygen Concentrators",
      desc: fr ? "5 L, 10 L, double débit et portables" : "5 L, 10 L, dual flow and portable",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-4.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM12 3v3m0 12v3M3 12h3m12 0h3" />
        </svg>
      ),
    },
    {
      title: "CPAP & Auto-CPAP",
      desc: fr ? "Traitement de l'apnée du sommeil" : "Sleep apnea treatment",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M12 3.75v16.5M7 7l10 10M17 7L7 17" opacity="0" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12.75A9.75 9.75 0 1111.25 2.25c-.62 1.03-.98 2.24-.98 3.53 0 3.87 3.13 7 7 7 1.29 0 2.5-.35 3.53-.97l.95.94z" />
        </svg>
      ),
    },
    {
      title: "VNI · BiPAP",
      desc: fr ? "Ventilation non invasive bi-niveau" : "Bi-level non-invasive ventilation",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2-7 4 14 2-7h6" />
        </svg>
      ),
    },
    {
      title: fr ? "Masques & Accessoires" : "Masks & Accessories",
      desc: fr ? "Nasaux, faciaux et narinaires" : "Nasal, full-face and pillow",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-4 0-7.5 2.2-7.5 5.5 0 2.1 1.3 3.9 3.4 4.9L7.5 19.5l3.4-2.1c.36.05.73.08 1.1.08 4 0 7.5-2.2 7.5-5.5s-3.5-5.48-7.5-5.48z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="products" className="relative py-12 sm:py-20 lg:py-28 bg-gray-50/70 overflow-hidden">
      <div className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={fr ? "Notre gamme" : "Our range"}
          title={fr ? "Des solutions respiratoires" : "Respiratory solutions"}
          accent={fr ? "complètes" : "end to end"}
          description={t.products.subtitle}
        />

        {/* Family cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
          {families.map((f, i) => (
            <Reveal key={f.title} delay={i * 90} className="h-full">
              <Link
                href="/products"
                className="group block bg-white rounded-2xl border border-gray-100 p-5 sm:p-7 h-full shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 sm:mb-5 group-hover:bg-gradient-to-b group-hover:from-purple-600 group-hover:to-purple-700 group-hover:text-white transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-[15px] sm:text-base mb-1.5 leading-snug">{f.title}</h3>
                <p className="text-[13px] sm:text-sm text-gray-500 leading-relaxed mb-0 sm:mb-4">{f.desc}</p>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-purple-600 group-hover:gap-2.5 transition-all">
                  {fr ? "Découvrir" : "Discover"}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Featured rail header */}
        <Reveal>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-2">
                {fr ? "Produits vedettes" : "Featured products"}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                {fr ? "Les plus demandés" : "Most requested"}
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollRail(-1)}
                aria-label="Précédent"
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-purple-700 hover:border-purple-300 transition-colors"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={() => scrollRail(1)}
                aria-label="Suivant"
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-purple-700 hover:border-purple-300 transition-colors"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </Reveal>

        {/* Horizontal product rail */}
        <Reveal delay={100}>
          <div
            ref={railRef}
            className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="snap-start shrink-0 w-[220px] sm:w-[260px] bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="aspect-square bg-gray-100 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                    </div>
                  </div>
                ))
              : products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group snap-start shrink-0 w-[220px] sm:w-[260px] bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 overflow-hidden transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-square bg-white overflow-hidden">
                      {(product.thumbnail || product.images[0]) && (
                        <Image
                          src={product.thumbnail || product.images[0]}
                          alt={getName(product)}
                          fill
                          sizes="(max-width: 640px) 220px, 260px"
                          className="object-cover group-hover:scale-[1.06] transition-transform duration-500"
                        />
                      )}
                      {product.reference && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 ring-1 ring-gray-900/10 shadow-sm text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide">
                          {product.reference}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1 border-t border-gray-50">
                      {getFamily(product) && (
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 mb-1">
                          {getFamily(product)}
                        </p>
                      )}
                      <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-purple-700 transition-colors">
                        {getName(product)}
                      </h4>
                    </div>
                  </Link>
                ))}

            {/* End card */}
            {!loading && (
              <Link
                href="/products"
                className="snap-start shrink-0 w-[220px] sm:w-[260px] min-h-[240px] rounded-2xl border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50 flex flex-col items-center justify-center gap-3 text-purple-700 transition-colors"
              >
                <span className="w-12 h-12 rounded-full bg-white border border-purple-200 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
                <span className="text-sm font-bold">{fr ? "Tous les produits" : "All products"}</span>
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
