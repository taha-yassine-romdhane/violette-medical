"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";

export default function About() {
  const { t, language } = useLanguage();
  const fr = language === "fr";

  const features = [
    {
      title: t.about.mission.title,
      text: t.about.mission.text,
    },
    {
      title: t.about.vision.title,
      text: t.about.vision.text,
    },
    {
      title: t.about.values.title,
      text: t.about.values.text,
    },
  ];

  return (
    <section id="about" className="relative py-12 sm:py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-9 sm:gap-14 lg:gap-20 items-center">
          {/* Left: copy + checklist */}
          <div>
            <Reveal>
              <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-4">
                <span className="w-8 h-px bg-purple-300" />
                {fr ? "À propos" : "About us"}
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="text-[1.75rem] sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-gray-900 leading-tight mb-5">
                {fr ? (
                  <>
                    Un partenaire médical fiable pour un{" "}
                    <span className="text-gradient-violet">monde qui respire</span>
                  </>
                ) : (
                  <>
                    A reliable medical partner for a{" "}
                    <span className="text-gradient-violet">breathing world</span>
                  </>
                )}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-gray-500 leading-relaxed mb-6 sm:mb-8">{t.about.description}</p>
            </Reveal>

            <div className="space-y-4 sm:space-y-5 mb-7 sm:mb-9">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={180 + i * 90}>
                  <div className="flex gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-600 transition-colors duration-300">
                      <svg className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-0.5">{f.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{f.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={420}>
              <Link href="/about" className="btn-primary btn-md group">
                {fr ? "En savoir plus" : "Learn more"}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </Reveal>
          </div>

          {/* Right: floating photo collage + stat card */}
          <Reveal variant="right" delay={150}>
            <div className="relative h-[300px] sm:h-[460px] lg:h-[520px]">
              {/* Main photo */}
              <div className="absolute top-0 right-0 w-[72%] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/15 ring-1 ring-gray-900/5 z-10">
                <Image
                  src="/events/564100826_122106806667047472_8075826048383053550_n.jpg"
                  alt="Stand Yuwell"
                  fill
                  sizes="(max-width: 1024px) 70vw, 35vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Secondary photo */}
              <div className="absolute bottom-10 sm:bottom-6 left-0 w-[52%] sm:w-[55%] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-purple-900/10 ring-1 ring-gray-900/5 border-4 border-white z-20 animate-float-slower">
                <Image
                  src="/events/600166683_122121025599047472_608712458794395501_n.jpg"
                  alt="Produits Yuwell"
                  fill
                  sizes="(max-width: 1024px) 55vw, 28vw"
                  className="object-cover"
                />
              </div>
              {/* Stat card */}
              <div className="absolute bottom-0 right-4 z-30 animate-float-slow">
                <div className="bg-gradient-to-b from-purple-600 to-purple-800 rounded-2xl shadow-2xl shadow-purple-900/30 px-4 py-4 sm:px-6 sm:py-5 text-white">
                  <p className="text-2xl sm:text-3xl font-bold">
                    <CountUp value={10} suffix="+" />
                  </p>
                  <p className="text-[11px] sm:text-xs text-purple-200 mt-1 max-w-[96px] sm:max-w-[110px] leading-snug">
                    {fr ? "Années d'expérience médicale" : "Years of medical experience"}
                  </p>
                </div>
              </div>
              {/* Deco dots */}
              <div className="hidden sm:block absolute -top-6 left-8 w-24 h-24 rounded-3xl border-2 border-purple-200/80 -z-0" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
