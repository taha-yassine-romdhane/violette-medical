"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

const catalogues = [
  {
    id: "electronic-medical",
    titleFr: "Produits Médicaux Électroniques",
    titleEn: "Electronic Medical Products",
    pdf: "/catalogue-and-images/2024 Electronic Medical Products.pdf",
    cover: "/products/yuwell-8f-5a.jpg",
    category: "Yuwell",
    year: "2024",
  },
  {
    id: "breathcare-pap",
    titleFr: "Yuwell BreathCare PAP",
    titleEn: "Yuwell BreathCare PAP",
    pdf: "/catalogue-and-images/2024 Yuwell Breathcare PAP.pdf",
    cover: "/products/yuwell-yh-550.jpg",
    category: "CPAP/BiPAP",
    year: "2024",
  },
  {
    id: "breathcare-brochure",
    titleFr: "Brochure BreathCare",
    titleEn: "BreathCare Brochure",
    pdf: "/catalogue-and-images/BreathCare Web Brochure .pdf",
    cover: "/products/yuwell-yh-350.jpg",
    category: "Brochure",
  },
  {
    id: "masks",
    titleFr: "Catalogue Masques",
    titleEn: "Masks Catalogue",
    pdf: "/catalogue-and-images/Mask/mask.pdf",
    cover: "/products/yuwell-yn-02.jpg",
    category: "Masques",
  },
  {
    id: "yh680-fr",
    titleFr: "Guide YH-680AB (FR)",
    titleEn: "YH-680AB Guide (FR)",
    pdf: "/catalogue-and-images/PAP & Mask/YH-680AB  French.pdf",
    cover: "/products/yuwell-yh-680.jpg",
    category: "Guide",
  },
];

export default function Catalogue() {
  const { language } = useLanguage();
  const fr = language === "fr";

  return (
    <section id="catalogue" className="py-16 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Documentation"
          title={fr ? "Catalogues &" : "Catalogues &"}
          accent={fr ? "brochures" : "brochures"}
          description={
            fr
              ? "Toute la documentation officielle Yuwell, prête à télécharger et à partager avec vos équipes."
              : "All official Yuwell documentation, ready to download and share with your teams."
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {catalogues.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 80} className="h-full">
              <a
                href={cat.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 overflow-hidden transition-all duration-300"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-white">
                  <Image
                    src={cat.cover}
                    alt={fr ? cat.titleFr : cat.titleEn}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                  />
                  {/* Hover veil with download */}
                  <div className="absolute inset-0 bg-gray-950/0 group-hover:bg-gray-950/50 transition-colors duration-300 flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
                      <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </span>
                  </div>
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className="bg-gray-950/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      PDF
                    </span>
                    {cat.year && (
                      <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {cat.year}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-1">{cat.category}</p>
                  <h3 className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-purple-700 transition-colors">
                    {fr ? cat.titleFr : cat.titleEn}
                  </h3>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
