"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

interface Slide {
  id: string;
  titleFr: string | null;
  titleEn: string | null;
  subtitleFr: string | null;
  subtitleEn: string | null;
  image: string;
  link: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
}

export default function Hero() {
  const { language, t } = useLanguage();
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    fetch("/api/sliders")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSlides(data))
      .catch(() => setSlides([]));
  }, []);

  const getTitle = (slide: Slide) =>
    (language === "en" ? slide.titleEn || slide.titleFr : slide.titleFr) || "";

  const fr = language === "fr";

  return (
    <section id="home" className="relative mt-20 overflow-hidden bg-white">
      {/* Backdrop: soft grid + violet aurora */}
      <div className="absolute inset-0 bg-grid-light pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-32 w-[560px] h-[560px] bg-purple-300/30 rounded-full blur-3xl animate-float-slower" />
        <div className="absolute top-1/2 -left-48 w-[460px] h-[460px] bg-violet-200/40 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 lg:pt-20 pb-11 sm:pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-9 sm:gap-14 lg:gap-10 items-center">
          {/* ------------------------------------------------ Left: statement */}
          <div>
            <Reveal>
              <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-white border border-purple-100 shadow-sm shadow-purple-900/5 rounded-full pl-2 pr-3.5 sm:pr-4 py-1.5 mb-6 sm:mb-7 max-w-full">
                <span className="bg-purple-50 rounded-full px-2 py-0.5">
                  <Image src="/Yuwell.webp" alt="Yuwell" width={64} height={22} className="h-4 w-auto object-contain" />
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-purple-800 tracking-wide">
                  {fr ? "Représentant Officiel Yuwell en Tunisie" : "Official Yuwell Representative in Tunisia"}
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-[2.05rem] sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.08] sm:leading-[1.05] mb-5 sm:mb-6">
                {fr ? (
                  <>
                    L&apos;excellence
                    <br />
                    <span className="text-gradient-violet">respiratoire</span>,
                    <br />
                    livrée en Tunisie.
                  </>
                ) : (
                  <>
                    Respiratory
                    <br />
                    <span className="text-gradient-violet">excellence</span>,
                    <br />
                    delivered in Tunisia.
                  </>
                )}
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-[15px] sm:text-lg text-gray-500 leading-relaxed mb-8 sm:mb-9 max-w-lg">
                {fr
                  ? "CPAP, VNI, concentrateurs d'oxygène, masques — la gamme respiratoire Yuwell complète, en gros, pour les professionnels de santé."
                  : "CPAP, NIV, oxygen concentrators, masks — the complete Yuwell respiratory range, wholesale, for healthcare professionals."}
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 mb-9 sm:mb-10 [&>a]:w-full sm:[&>a]:w-auto">
                <Link href="#products" className="btn-primary btn-lg group">
                  {t.hero.cta}
                  <svg className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="#contact" className="btn-outline btn-lg">
                  {t.hero.contact}
                </Link>
              </div>
            </Reveal>

            {/* Trust metrics with animated counters */}
            <Reveal delay={320}>
              <div className="grid grid-cols-3 max-w-md divide-x divide-gray-200 border-t border-gray-100 pt-6 sm:pt-7">
                {[
                  { value: 110, suffix: "+", label: fr ? "Pays Yuwell" : "Yuwell countries" },
                  { value: 30, suffix: "+", label: fr ? "Ans d'innovation" : "Years of innovation" },
                  { value: 500, suffix: "+", label: fr ? "Clients pros" : "Pro clients" },
                ].map((stat) => (
                  <div key={stat.label} className="px-2.5 sm:px-4 first:pl-0">
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">
                      <CountUp value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ------------------------------------------------ Right: live visual */}
          <Reveal variant="scale" delay={200} className="relative">
            <div className="relative">
              {/* Photo carousel card */}
              <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden bg-gray-100 shadow-xl sm:shadow-2xl shadow-purple-900/15 border border-white ring-1 ring-gray-900/5">
                {/* The ratio lives on this plain box and the carousel is pinned inside it.
                    Putting aspect-ratio on the Swiper itself makes its percentage-sized
                    wrapper/slides feed back into the parent size and the layout runs away. */}
                <div className="relative w-full aspect-[4/3]">
                  {slides.length > 0 ? (
                    <Swiper
                      modules={[Autoplay, EffectFade, Pagination]}
                      effect="fade"
                      autoplay={{ delay: 4500, disableOnInteraction: false }}
                      pagination={{
                        clickable: true,
                        bulletClass: "swiper-pagination-bullet !w-1.5 !h-1.5 !bg-white/60 !opacity-100 !transition-all",
                        bulletActiveClass: "!bg-white !w-5 !rounded-full",
                      }}
                      loop={slides.length > 1}
                      className="absolute inset-0 h-full w-full"
                    >
                      {slides.map((slide, index) => (
                        <SwiperSlide key={slide.id}>
                          <div className="relative w-full h-full">
                            <Image
                              src={slide.image}
                              alt={getTitle(slide) || "Violette Medical"}
                              fill
                              priority={index === 0}
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              className="object-cover"
                            />
                            {getTitle(slide) && (
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950/75 via-gray-950/25 to-transparent pt-12 sm:pt-16 pb-4 sm:pb-5 px-4 sm:px-6">
                                <p className="text-white font-semibold text-[13px] sm:text-base drop-shadow line-clamp-2">
                                  {getTitle(slide)}
                                </p>
                              </div>
                            )}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <Image src="/slider.jpg" alt="Violette Medical" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                  )}
                </div>
              </div>

              {/* Trust row — mobile only (the floating chips below are a desktop flourish) */}
              <div className="grid grid-cols-2 gap-2.5 mt-3 sm:hidden">
                <div className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-900 leading-tight">CE · FDA</p>
                    <p className="text-[10px] text-gray-500 leading-tight">ISO 13485</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-900 leading-tight">{fr ? "Support" : "Support"}</p>
                    <p className="text-[10px] text-gray-500 leading-tight">{fr ? "Formation incluse" : "Training incl."}</p>
                  </div>
                </div>
              </div>

              {/* Floating chip: certification */}
              <div className="hidden sm:block absolute sm:-left-8 top-4 sm:top-8 animate-float-slow z-10">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-900">CE · FDA · ISO 13485</p>
                    <p className="text-[10px] sm:text-[11px] text-gray-500">{fr ? "Dispositifs certifiés" : "Certified devices"}</p>
                  </div>
                </div>
              </div>

              {/* Floating chip: support */}
              <div className="hidden sm:block absolute sm:-right-6 bottom-4 sm:bottom-10 animate-float-slower z-10">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-900">{fr ? "Support technique" : "Technical support"}</p>
                    <p className="text-[10px] sm:text-[11px] text-gray-500">{fr ? "Formation incluse" : "Training included"}</p>
                  </div>
                </div>
              </div>

              {/* Accent ring behind the card */}
              <div className="hidden sm:block absolute -z-10 -top-6 -right-6 w-40 h-40 rounded-[2rem] border-2 border-purple-200/70" />
              <div className="hidden sm:block absolute -z-10 -bottom-6 -left-6 w-40 h-40 rounded-[2rem] bg-purple-100/50" />
            </div>
          </Reveal>
        </div>
      </div>

      {/* Marquee band */}
      <div className="relative border-t border-gray-100 bg-white/60 backdrop-blur-sm py-4 overflow-hidden marquee-mask">
        <div className="flex w-max animate-marquee gap-8 sm:gap-12 pr-8 sm:pr-12">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-8 sm:gap-12 shrink-0" aria-hidden={copy === 1}>
              {[
                fr ? "Concentrateurs d'Oxygène" : "Oxygen Concentrators",
                "CPAP & Auto-CPAP",
                "VNI · BiPAP",
                fr ? "Masques & Accessoires" : "Masks & Accessories",
                "Yuwell BreathCare",
                "CE · FDA · ISO 13485",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
