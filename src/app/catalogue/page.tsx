"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";

const catalogues = [
  {
    id: 1,
    titleFr: "Produits Médicaux Électroniques",
    titleEn: "Electronic Medical Products",
    descFr: "Catalogue complet de la gamme Yuwell",
    descEn: "Complete Yuwell product range catalogue",
    image: "/products/yuwell-8f-5a.jpg",
    pdf: "/catalogue-and-images/2024 Electronic Medical Products.pdf",
    category: "Yuwell",
    year: "2024",
  },
  {
    id: 2,
    titleFr: "Yuwell BreathCare PAP",
    titleEn: "Yuwell BreathCare PAP",
    descFr: "Appareils CPAP, Auto-CPAP et BiPAP",
    descEn: "CPAP, Auto-CPAP and BiPAP devices",
    image: "/products/yuwell-yh-550.jpg",
    pdf: "/catalogue-and-images/2024 Yuwell Breathcare PAP.pdf",
    category: "CPAP/VNI",
    year: "2024",
  },
  {
    id: 3,
    titleFr: "Brochure BreathCare",
    titleEn: "BreathCare Brochure",
    descFr: "Solutions respiratoires complètes",
    descEn: "Complete respiratory solutions",
    image: "/products/yuwell-yh-350.jpg",
    pdf: "/catalogue-and-images/BreathCare Web Brochure .pdf",
    category: "CPAP/VNI",
  },
  {
    id: 4,
    titleFr: "Catalogue Masques",
    titleEn: "Masks Catalogue",
    descFr: "Masques nasaux, faciaux et à coussinets",
    descEn: "Nasal, full-face and pillow masks",
    image: "/products/yuwell-yn-02.jpg",
    pdf: "/catalogue-and-images/Mask/mask.pdf",
    category: "Masques",
  },
  {
    id: 5,
    titleFr: "Guide YH-680AB",
    titleEn: "YH-680AB French Guide",
    descFr: "Documentation technique en français",
    descEn: "Technical documentation in French",
    image: "/products/yuwell-yh-680.jpg",
    pdf: "/catalogue-and-images/PAP & Mask/YH-680AB  French.pdf",
    category: "Guides",
  },
];

export default function CataloguePage() {
  const { language, t } = useLanguage();

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
              {language === "fr" ? (
                <>Nos <span className="text-gradient-violet">catalogues</span></>
              ) : (
                <>Our <span className="text-gradient-violet">catalogues</span></>
              )}
            </h1>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl">
              {language === "fr"
                ? "Téléchargez nos catalogues et brochures produits officiels Yuwell"
                : "Download our official Yuwell product catalogues and brochures"}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogues.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 100}>
                <a
                  href={cat.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 overflow-hidden transition-all duration-300"
                >
                  {/* Book cover */}
                  <div className="relative aspect-[3/4] bg-white overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={language === "en" ? cat.titleEn : cat.titleFr}
                      fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Hover veil with download button */}
                    <div className="absolute inset-0 bg-gray-950/0 group-hover:bg-gray-950/50 transition-colors duration-300 flex items-center justify-center">
                      <span className="w-14 h-14 rounded-full bg-white flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
                        <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                    </div>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-gray-950/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {cat.category}
                      </span>
                      {cat.year && (
                        <span className="bg-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                          {cat.year}
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-gray-950/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      PDF
                    </span>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600 mb-1.5">
                      {cat.category}
                    </p>
                    <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
                      {language === "en" ? cat.titleEn : cat.titleFr}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {language === "en" ? cat.descEn : cat.descFr}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 group-hover:gap-3 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {language === "fr" ? "Télécharger PDF" : "Download PDF"}
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
