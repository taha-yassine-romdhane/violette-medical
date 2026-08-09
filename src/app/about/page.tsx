"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      title: t.about.mission.title,
      description: t.about.mission.text,
    },
    {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
      title: t.about.vision.title,
      description: t.about.vision.text,
    },
    {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
      title: t.about.values.title,
      description: t.about.values.text,
    },
  ];

  const stats = [
    { number: "10+", label: language === "fr" ? "Années d'expérience" : "Years of experience" },
    { number: "500+", label: language === "fr" ? "Clients satisfaits" : "Satisfied clients" },
    { number: "50+", label: language === "fr" ? "Produits" : "Products" },
    { number: "24/7", label: "Support" },
  ];

  const certifications = ["CE", "FDA", "ISO 13485"];

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
              <span className="text-white font-medium">{t.nav.about}</span>
            </div>
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 bg-purple-500/10 border border-purple-400/20 rounded-full px-4 py-1.5 mb-4">
              {language === "fr" ? "Qui sommes-nous" : "Who we are"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">{t.about.title}</h1>
            <p className="text-gray-400 text-lg max-w-2xl">{t.about.subtitle}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* About description */}
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-lg text-gray-400 leading-relaxed">{t.about.description}</p>
          </div>

          {/* Mission / Vision / Values */}
          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {features.map((f, i) => (
              <div key={i} className="bg-white/[0.04] rounded-2xl p-8 border border-white/10 hover:border-purple-400/40 hover:bg-white/[0.07] transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-300 mb-6">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed text-[15px]">{f.description}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-white/[0.04] rounded-2xl border border-white/10 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 mb-14">
            {stats.map((s, i) => (
              <div key={i} className="text-center py-8 px-4">
                <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-1.5 tabular-nums">{s.number}</div>
                <div className="text-sm text-gray-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Yuwell Partnership */}
          <div className="relative overflow-hidden bg-gray-900 rounded-3xl border border-white/10 p-8 lg:p-12 mb-14">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-700/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 mb-4">
                  {language === "fr" ? "Partenariat exclusif" : "Exclusive partnership"}
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-4">
                  {language === "fr" ? "Représentant officiel Yuwell en Tunisie" : "Official Yuwell representative in Tunisia"}
                </h2>
                <p className="text-gray-400 leading-relaxed mb-7">
                  {language === "fr"
                    ? "Yuwell est un leader mondial dans le domaine des dispositifs médicaux, présent dans plus de 110 pays. Nous sommes fiers d'être leur représentant officiel en Tunisie pour la gamme respiratoire."
                    : "Yuwell is a global leader in medical devices, present in over 110 countries. We are proud to be their official representative in Tunisia for the respiratory range."}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {certifications.map((cert) => (
                    <span key={cert} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 border border-white/15 rounded-full text-gray-200 text-sm font-medium">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-2xl p-10">
                  <Image src="/Yuwell.webp" alt="Yuwell" width={300} height={100} className="h-20 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
              {language === "fr" ? "Intéressé par nos produits ?" : "Interested in our products?"}
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-3.5">
              <Link href="/products" className="btn-primary btn-lg">
                {t.products.viewAll}
              </Link>
              <Link href="/contact" className="btn-outline-light btn-lg">
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
