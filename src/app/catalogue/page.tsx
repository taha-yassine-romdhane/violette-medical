"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <main className="pt-20 min-h-screen bg-gray-950">
        {/* Page hero */}
        <div className="relative bg-gray-900 border-b border-white/10 overflow-hidden">
          <div className="absolute -top-24 right-1/4 w-[420px] h-[420px] bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
              <Link href="/" className="hover:text-purple-300 transition-colors">{t.nav.home}</Link>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              <span className="text-white font-medium">{t.nav.catalogue}</span>
            </div>
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 bg-purple-500/10 border border-purple-400/20 rounded-full px-4 py-1.5 mb-4">
              {language === "fr" ? "Documentation" : "Documentation"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">{t.nav.catalogue}</h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              {language === "fr"
                ? "Téléchargez nos catalogues et brochures produits officiels Yuwell"
                : "Download our official Yuwell product catalogues and brochures"}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogues.map((cat) => (
              <div
                key={cat.id}
                className="group bg-white/[0.04] rounded-2xl border border-white/10 hover:border-purple-400/40 hover:bg-white/[0.07] overflow-hidden transition-all duration-300 flex flex-col"
              >
                <div className="relative h-52 bg-white overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={language === "en" ? cat.titleEn : cat.titleFr}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
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
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-white mb-1">
                    {language === "en" ? cat.titleEn : cat.titleFr}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5 flex-1">
                    {language === "en" ? cat.descEn : cat.descFr}
                  </p>
                  <a
                    href={cat.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary px-4 py-2.5 text-sm self-start"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {language === "fr" ? "Télécharger PDF" : "Download PDF"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
