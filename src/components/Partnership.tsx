"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";

export default function Partnership() {
  const { language } = useLanguage();
  const fr = language === "fr";

  const points = fr
    ? [
        "Représentant officiel et exclusif Yuwell en Tunisie",
        "Produits certifiés CE, FDA et ISO 13485",
        "Formation et assistance technique complète",
        "Disponibilité des pièces et accessoires",
      ]
    : [
        "Official and exclusive Yuwell representative in Tunisia",
        "CE, FDA and ISO 13485 certified products",
        "Complete training and technical assistance",
        "Parts and accessories availability",
      ];

  return (
    <section id="partnership" className="relative py-16 sm:py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-14 lg:gap-20 items-center">
          {/* Left: copy */}
          <div>
            <Reveal>
              <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-4">
                <span className="w-8 h-px bg-purple-300" />
                {fr ? "Partenariat exclusif" : "Exclusive partnership"}
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="text-[1.75rem] sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-gray-900 leading-tight mb-5">
                {fr ? (
                  <>
                    Bien plus qu&apos;un distributeur, un{" "}
                    <span className="text-gradient-violet">partenaire Yuwell</span>
                  </>
                ) : (
                  <>
                    More than a distributor, a{" "}
                    <span className="text-gradient-violet">Yuwell partner</span>
                  </>
                )}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-gray-500 leading-relaxed mb-8">
                {fr
                  ? "Yuwell est un leader mondial des dispositifs médicaux respiratoires. En tant que représentant officiel, nous garantissons l'authenticité des produits, le support constructeur et la continuité d'approvisionnement."
                  : "Yuwell is a global leader in respiratory medical devices. As official representative, we guarantee product authenticity, manufacturer support and supply continuity."}
              </p>
            </Reveal>

            <div className="space-y-3.5 mb-9">
              {points.map((point, i) => (
                <Reveal key={point} delay={180 + i * 70}>
                  <div className="flex items-center gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm sm:text-[15px] text-gray-700 font-medium leading-snug">{point}</span>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={480}>
              <div className="inline-flex flex-wrap items-center gap-3 sm:gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-4 sm:px-6 py-4 max-w-full">
                <Image src="/Yuwell.webp" alt="Yuwell" width={110} height={38} className="h-9 w-auto object-contain" />
                <div className="hidden sm:block w-px h-8 bg-gray-200" />
                <p className="text-xs text-gray-500 leading-snug max-w-[180px]">
                  {fr ? "Partenaire officiel — Yuwell Medical Technology" : "Official partner — Yuwell Medical Technology"}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right: dark stats card (reference style) */}
          <Reveal variant="right" delay={150}>
            <div className="relative">
              <div className="relative bg-gray-950 rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 overflow-hidden shadow-2xl shadow-purple-900/25">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-28 -left-20 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

                <p className="relative text-white font-bold text-lg mb-8">
                  {fr ? "Yuwell dans le monde" : "Yuwell worldwide"}
                </p>

                <div className="relative grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-7 sm:gap-y-9">
                  {[
                    { value: 110, suffix: "+", label: fr ? "Pays desservis" : "Countries served" },
                    { value: 30, suffix: "+", label: fr ? "Ans de R&D" : "Years of R&D" },
                    { value: 19, suffix: "", label: fr ? "Modèles au catalogue" : "Models in catalogue" },
                    { value: 3, suffix: "", label: fr ? "Certifications majeures" : "Major certifications" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-start gap-3.5">
                      <span className="hidden sm:flex w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/20 items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4.5 h-4.5 text-purple-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold text-white leading-none">
                          <CountUp value={stat.value} suffix={stat.suffix} />
                        </p>
                        <p className="text-xs sm:text-[13px] text-gray-400 mt-1.5 leading-snug">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative mt-8 sm:mt-9 pt-6 sm:pt-7 border-t border-white/10 flex flex-wrap gap-2 sm:gap-2.5">
                  {["CE", "FDA", "ISO 13485"].map((cert) => (
                    <span key={cert} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 border border-white/15 rounded-full text-gray-200 text-sm font-medium">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deco */}
              <div className="hidden sm:block absolute -z-10 -bottom-5 -right-5 w-48 h-48 rounded-[2rem] bg-purple-100" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
