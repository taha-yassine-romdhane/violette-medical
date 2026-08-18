"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";
import BrochureViewer from "@/components/BrochureViewer";
import { brochures, familyLabel, type FamilyKey } from "@/lib/brochures";

/* Full catalogues stay available, but as a quiet secondary list. */
const fullCatalogues = [
  {
    titleFr: "Produits Médicaux Électroniques",
    titleEn: "Electronic Medical Products",
    descFr: "Toute la gamme Yuwell",
    descEn: "The full Yuwell range",
    pdf: "/catalogue-and-images/2024 Electronic Medical Products.pdf",
    cover: "/products/yuwell-8f-5a.jpg",
    year: "2024",
    size: "17 Mo",
    sizeEn: "17 MB",
  },
  {
    titleFr: "Yuwell BreathCare PAP",
    titleEn: "Yuwell BreathCare PAP",
    descFr: "CPAP, Auto-CPAP et BiPAP",
    descEn: "CPAP, Auto-CPAP and BiPAP",
    pdf: "/catalogue-and-images/2024 Yuwell Breathcare PAP.pdf",
    cover: "/products/yuwell-yh-550.jpg",
    year: "2024",
    size: "35 Mo",
    sizeEn: "35 MB",
  },
  {
    titleFr: "Brochure BreathCare",
    titleEn: "BreathCare Brochure",
    descFr: "Solutions respiratoires",
    descEn: "Respiratory solutions",
    pdf: "/catalogue-and-images/BreathCare Web Brochure .pdf",
    cover: "/products/yuwell-yh-350.jpg",
    year: null,
    size: "3 Mo",
    sizeEn: "3 MB",
  },
  {
    titleFr: "Catalogue Masques",
    titleEn: "Masks Catalogue",
    descFr: "Nasaux, faciaux, narinaires",
    descEn: "Nasal, full-face, pillow",
    pdf: "/catalogue-and-images/Mask/mask.pdf",
    cover: "/products/yuwell-yn-02.jpg",
    year: null,
    size: "0,3 Mo",
    sizeEn: "0.3 MB",
  },
  {
    titleFr: "Guide YH-680AB (FR)",
    titleEn: "YH-680AB Guide (FR)",
    descFr: "Documentation technique VNI",
    descEn: "NIV technical documentation",
    pdf: "/catalogue-and-images/PAP & Mask/YH-680AB  French.pdf",
    cover: "/products/yuwell-yh-680.jpg",
    year: null,
    size: "12 Mo",
    sizeEn: "12 MB",
  },
];

export default function CataloguePage() {
  const { language, t } = useLanguage();
  const fr = language === "fr";
  const [family, setFamily] = useState<"all" | FamilyKey>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filters: { key: "all" | FamilyKey; label: string }[] = [
    { key: "all", label: fr ? "Tous" : "All" },
    { key: "oxygen", label: familyLabel("oxygen", fr) },
    { key: "pap", label: familyLabel("pap", fr) },
    { key: "mask", label: familyLabel("mask", fr) },
  ];

  const visible = family === "all" ? brochures : brochures.filter((b) => b.family === family);

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-white">
        {/* Page hero */}
        <div className="relative bg-white border-b border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none" />
          <div className="absolute -top-24 right-1/4 w-[420px] h-[420px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3 sm:mb-5">
              <Link href="/" className="hover:text-purple-700 transition-colors">{t.nav.home}</Link>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              <span className="text-gray-900 font-medium">{t.nav.catalogue}</span>
            </div>
            <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-2 sm:mb-4">
              <span className="w-8 h-px bg-purple-300" />
              Documentation
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-2 sm:mb-3">
              {fr ? (
                <>Brochures <span className="text-gradient-violet">produits</span></>
              ) : (
                <>Product <span className="text-gradient-violet">brochures</span></>
              )}
            </h1>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl">
              {fr
                ? "Consultez la fiche officielle de chaque produit Yuwell directement en ligne — sans rien télécharger."
                : "Browse each Yuwell product's official brochure directly online — no download needed."}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
          {/* Family filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap mb-7 sm:mb-9 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFamily(f.key); setOpenIndex(null); }}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  family === f.key
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Brochure grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {visible.map((b, i) => (
              <Reveal key={b.id} delay={Math.min(i, 7) * 60}>
                <button
                  onClick={() => setOpenIndex(i)}
                  className="group w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 overflow-hidden transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                    <Image
                      src={b.poster}
                      alt={`${b.model} — ${fr ? b.subtitleFr : b.subtitleEn}`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-500"
                    />
                    {/* View affordance */}
                    <div className="absolute inset-0 bg-gray-950/0 group-hover:bg-gray-950/40 transition-colors duration-300 flex items-center justify-center">
                      <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
                        <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{familyLabel(b.family, fr)}</p>
                    <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 leading-snug">{b.model}</h3>
                    <p className="text-xs sm:text-[13px] text-gray-500 leading-snug">{fr ? b.subtitleFr : b.subtitleEn}</p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>

          {/* Full catalogues — richer download cards */}
          <div className="mt-12 sm:mt-16">
            <div className="flex items-end justify-between gap-4 mb-5 sm:mb-7">
              <div>
                <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-2.5">
                  <span className="w-8 h-px bg-purple-300" />
                  PDF
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                  {fr ? "Catalogues complets" : "Full catalogues"}
                </h2>
                <p className="text-sm sm:text-[15px] text-gray-500 mt-1">
                  {fr
                    ? "La gamme entière en un seul document, à partager avec vos équipes."
                    : "The entire range in a single document, ready to share with your teams."}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {fullCatalogues.map((cat, i) => (
                <Reveal key={cat.pdf} delay={i * 70}>
                  <a
                    href={cat.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 bg-white border border-gray-100 hover:border-gray-300 rounded-2xl p-3 sm:p-3.5 shadow-sm hover:shadow-lg hover:shadow-purple-900/5 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Cover thumb */}
                    <div className="relative w-14 h-[72px] sm:w-16 sm:h-20 rounded-lg overflow-hidden bg-gray-50 ring-1 ring-gray-900/5 shrink-0">
                      <Image
                        src={cat.cover}
                        alt={fr ? cat.titleFr : cat.titleEn}
                        fill
                        sizes="64px"
                        className="object-cover group-hover:scale-[1.06] transition-transform duration-500"
                      />
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-900 leading-snug truncate">
                        {fr ? cat.titleFr : cat.titleEn}
                      </h3>
                      <p className="text-xs text-gray-500 leading-snug truncate mt-0.5">
                        {fr ? cat.descFr : cat.descEn}
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mt-1.5">
                        <span className="uppercase tracking-wide">PDF</span>
                        {cat.year && (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                            {cat.year}
                          </>
                        )}
                        <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                        {fr ? cat.size : cat.sizeEn}
                      </p>
                    </div>

                    {/* Download affordance */}
                    <span className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:text-white text-gray-500 flex items-center justify-center shrink-0 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Brochure viewer (lightbox) */}
      <BrochureViewer
        items={visible}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}
