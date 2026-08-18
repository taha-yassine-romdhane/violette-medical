"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/motion/Reveal";

export default function CtaBand() {
  const { language } = useLanguage();
  const fr = language === "fr";

  return (
    // Overlaps into the dark footer below (footer compensates with extra top padding)
    <section className="relative z-10 pt-12 sm:pt-14 -mb-20 sm:-mb-28 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] bg-gradient-to-br from-purple-700 via-purple-800 to-gray-950 shadow-2xl shadow-purple-900/40 ring-1 ring-white/10">
            {/* Glows + texture */}
            <div className="absolute -top-24 right-1/3 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-violet-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-grid-light opacity-[0.07] pointer-events-none" />
            {/* Big decorative ring */}
            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border-[28px] border-white/5 pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-5 items-center">
              {/* Text + actions */}
              <div className="lg:col-span-3 px-6 py-10 sm:px-14 sm:py-16">
                <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full pl-1.5 pr-3.5 sm:pr-4 py-1.5 mb-5 sm:mb-6 max-w-full">
                  <span className="bg-white rounded-full px-2.5 py-1 flex items-center">
                    <Image src="/Yuwell.webp" alt="Yuwell" width={56} height={18} className="h-3.5 w-auto object-contain" />
                  </span>
                  <span className="text-[11px] font-semibold text-purple-100 uppercase tracking-wider">
                    {fr ? "Espace professionnel B2B" : "B2B professional space"}
                  </span>
                </div>

                <h2 className="text-[1.6rem] sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight mb-4">
                  {fr ? (
                    <>
                      Prêt à équiper vos patients avec{" "}
                      <span className="relative whitespace-nowrap">
                        le meilleur
                        <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                          <path d="M2 7C50 2 150 2 198 7" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                        </svg>
                      </span>{" "}
                      du respiratoire ?
                    </>
                  ) : (
                    <>
                      Ready to equip your patients with{" "}
                      <span className="relative whitespace-nowrap">
                        the best
                        <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                          <path d="M2 7C50 2 150 2 198 7" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                        </svg>
                      </span>{" "}
                      in respiratory care?
                    </>
                  )}
                </h2>

                <p className="text-[15px] sm:text-base text-purple-200/90 leading-relaxed mb-7 sm:mb-8 max-w-xl">
                  {fr
                    ? "Créez votre compte professionnel et accédez aux tarifs de gros, au suivi de commandes et au support technique."
                    : "Create your professional account and get wholesale prices, order tracking and technical support."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 [&>a]:w-full sm:[&>a]:w-auto">
                  <Link href="/contact" className="btn-light btn-lg group">
                    {fr ? "Devenir client" : "Become a client"}
                    <svg className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link href="/signin" className="btn-outline-light btn-lg">
                    {fr ? "Se connecter" : "Sign in"}
                  </Link>
                </div>

                {/* Trust row */}
                <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 mt-7 sm:mt-8 pt-6 border-t border-white/10">
                  {["CE", "FDA", "ISO 13485"].map((cert) => (
                    <span key={cert} className="flex items-center gap-1.5 text-purple-200/80 text-xs font-semibold tracking-wide">
                      <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {cert}
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5 text-purple-200/80 text-xs font-semibold tracking-wide">
                    <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    {fr ? "Garantie constructeur" : "Manufacturer warranty"}
                  </span>
                </div>
              </div>

              {/* Product visual (desktop) */}
              <div className="hidden lg:block lg:col-span-2 relative h-full min-h-[380px] pointer-events-none">
                {/* Main device card */}
                <div className="absolute top-1/2 -translate-y-1/2 right-14 w-56 rotate-3 animate-float-slow">
                  <div className="bg-white rounded-3xl p-3 shadow-2xl shadow-black/40 ring-1 ring-white/40">
                    <div className="relative aspect-square rounded-2xl overflow-hidden">
                      <Image src="/products/yuwell-yh-550.jpg" alt="Yuwell YH-550" fill sizes="224px" className="object-cover" />
                    </div>
                    <div className="px-2 py-2.5">
                      <p className="text-[11px] font-bold text-gray-900">Auto-CPAP YH-550</p>
                      <p className="text-[10px] text-gray-500">Yuwell BreathCare</p>
                    </div>
                  </div>
                </div>
                {/* Secondary device card */}
                <div className="absolute top-10 right-56 w-36 -rotate-6 animate-float-slower">
                  <div className="bg-white rounded-2xl p-2 shadow-xl shadow-black/30 ring-1 ring-white/30">
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                      <Image src="/products/yuwell-8f-5a.jpg" alt="Yuwell 8F-5A" fill sizes="144px" className="object-cover" />
                    </div>
                  </div>
                </div>
                {/* SN chip */}
                <div className="absolute bottom-12 right-40 animate-float-slow">
                  <div className="bg-gray-950/80 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5 shadow-lg">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                      {fr ? "Tracé par N° de série" : "Serial-number traced"}
                    </p>
                    <p className="text-[11px] font-mono text-emerald-300">SN-YH550-2026-0143 ✓</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
