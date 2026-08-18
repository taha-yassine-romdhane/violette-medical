"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/motion/Reveal";
import BrochureViewer from "@/components/BrochureViewer";
import { brochures, familyLabel } from "@/lib/brochures";

const featured = brochures.filter((b) => b.featured);

export default function Catalogue() {
  const { language } = useLanguage();
  const fr = language === "fr";
  const railRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function scrollRail(dir: 1 | -1) {
    railRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  }

  return (
    <section id="catalogue" className="py-12 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: title left, arrows right */}
        <div className="flex items-end justify-between gap-6 mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <Reveal>
              <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-4">
                <span className="w-8 h-px bg-purple-300" />
                Documentation
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-[1.75rem] sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-gray-900 leading-tight mb-3">
                {fr ? "Brochures" : "Product"}{" "}
                <span className="text-gradient-violet">{fr ? "produits" : "brochures"}</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-[15px] sm:text-lg text-gray-500 leading-relaxed">
                {fr
                  ? "La fiche officielle de chaque produit Yuwell, consultable en un clic — sans téléchargement."
                  : "Each Yuwell product's official brochure, viewable in one click — no download needed."}
              </p>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={() => scrollRail(-1)}
                aria-label={fr ? "Précédent" : "Previous"}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={() => scrollRail(1)}
                aria-label={fr ? "Suivant" : "Next"}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </Reveal>
        </div>

        {/* Horizontal snap carousel */}
        <Reveal delay={120}>
          <div
            ref={railRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {featured.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setOpenIndex(i)}
                className="group snap-start shrink-0 w-[186px] sm:w-[220px] text-left flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 overflow-hidden transition-all duration-300"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                  <Image
                    src={b.poster}
                    alt={`${b.model} — ${fr ? b.subtitleFr : b.subtitleEn}`}
                    fill
                    sizes="(max-width: 640px) 186px, 220px"
                    className="object-cover object-top group-hover:scale-[1.05] transition-transform duration-500"
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
                <div className="p-3 sm:p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    {familyLabel(b.family, fr)}
                  </p>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{b.model}</h3>
                  <p className="text-xs text-gray-500 leading-snug">{fr ? b.subtitleFr : b.subtitleEn}</p>
                </div>
              </button>
            ))}

            {/* End card → full brochure gallery */}
            <Link
              href="/catalogue"
              className="snap-start shrink-0 w-[186px] sm:w-[220px] rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-400 bg-gray-50/60 hover:bg-gray-50 flex flex-col items-center justify-center gap-3 text-gray-700 transition-colors"
            >
              <span className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
              <span className="text-sm font-bold text-center px-4 leading-snug">
                {fr ? "Toutes les brochures" : "All brochures"}
              </span>
              <span className="text-xs text-gray-400">{brochures.length} {fr ? "produits" : "products"}</span>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Fullscreen viewer */}
      <BrochureViewer
        items={featured}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </section>
  );
}
