"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";

const BOOTH_FRONT = "/events/564100826_122106806667047472_8075826048383053550_n.jpg";
const TEAM_PRESENTING = "/events/599942488_122121025365047472_4073525478158429045_n.jpg";
const BOOTH_YUWELL = "/events/564618186_122106806619047472_7949816668731789081_n.jpg";

export default function AboutPage() {
  const { t, language } = useLanguage();
  const fr = language === "fr";

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
    { value: 10, suffix: "+", label: fr ? "Années d'expérience" : "Years of experience" },
    { value: 500, suffix: "+", label: fr ? "Clients satisfaits" : "Satisfied clients" },
    { value: 19, suffix: "", label: fr ? "Modèles au catalogue" : "Models in catalogue" },
    { value: 110, suffix: "+", label: fr ? "Pays Yuwell" : "Yuwell countries" },
  ];

  const commitments = fr
    ? [
        { title: "Authenticité garantie", text: "Chaque dispositif provient directement de Yuwell et bénéficie de la garantie constructeur." },
        { title: "Traçabilité totale", text: "Nos appareils sont suivis par numéro de série, de l'importation jusqu'à la livraison." },
        { title: "Formation & accompagnement", text: "Nous formons vos équipes à l'utilisation de chaque équipement respiratoire." },
        { title: "Disponibilité & réactivité", text: "Un stock local, des pièces détachées et un support technique à vos côtés." },
      ]
    : [
        { title: "Guaranteed authenticity", text: "Every device comes directly from Yuwell and carries the manufacturer's warranty." },
        { title: "Full traceability", text: "Our devices are tracked by serial number, from import to delivery." },
        { title: "Training & support", text: "We train your teams to use every respiratory device." },
        { title: "Availability & responsiveness", text: "Local stock, spare parts and technical support by your side." },
      ];

  const gallery = [
    { src: "/events/602346078_122121025491047472_7840811801473083495_n.jpg", labelFr: "Salons médicaux", labelEn: "Medical fairs" },
    { src: "/events/600231957_122121025635047472_3574275256832917741_n.jpg", labelFr: "Gamme exposée", labelEn: "Range on display" },
    { src: "/events/602337863_122121025617047472_2267820127999732045_n.jpg", labelFr: "Démonstrations", labelEn: "Demonstrations" },
    { src: "/events/603094497_122121025407047472_2170369630110107771_n.jpg", labelFr: "Rencontres pros", labelEn: "Professional meetings" },
  ];

  const certifications = ["CE", "FDA", "ISO 13485"];

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-white">
        {/* ---------------------------------------------------- Page hero */}
        <div className="relative bg-white border-b border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none" />
          <div className="absolute -top-24 right-1/4 w-[420px] h-[420px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-24 w-[360px] h-[360px] bg-violet-200/40 rounded-full blur-3xl animate-float-slow pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3 sm:mb-6">
              <Link href="/" className="hover:text-purple-700 transition-colors">{t.nav.home}</Link>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              <span className="text-gray-900 font-medium">{t.nav.about}</span>
            </div>

            {/* Landing-style partner badge with live dot */}
            <Reveal>
              <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-white border border-purple-100 shadow-sm shadow-purple-900/5 rounded-full pl-2 pr-3.5 sm:pr-4 py-1.5 mb-3 sm:mb-6 max-w-full">
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
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-2 sm:mb-3 max-w-3xl leading-tight">
                {fr ? (
                  <>Au service du <span className="text-gradient-violet">souffle</span> des Tunisiens</>
                ) : (
                  <>At the service of Tunisia&apos;s <span className="text-gradient-violet">breath</span></>
                )}
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-gray-500 text-base sm:text-lg max-w-2xl">{t.about.subtitle}</p>
            </Reveal>
          </div>
        </div>

        {/* ---------------------------------------------------- Our story (white) */}
        <section className="relative py-16 lg:py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal variant="left">
                <div className="relative">
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/15 ring-1 ring-gray-900/5">
                    <Image src={BOOTH_FRONT} alt={fr ? "Stand Yuwell Violette Medical" : "Violette Medical Yuwell stand"} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                  {/* Floating chip — landing style */}
                  <div className="absolute -bottom-5 -right-3 sm:-right-5 animate-float-slow z-10">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white px-4 py-3 flex items-center gap-3">
                      <span className="bg-purple-50 rounded-lg px-2 py-1">
                        <Image src="/Yuwell.webp" alt="Yuwell" width={64} height={22} className="h-4 w-auto object-contain" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{fr ? "Partenaire officiel" : "Official partner"}</p>
                        <p className="text-[11px] text-gray-500">{fr ? "en Tunisie" : "in Tunisia"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block absolute -z-10 -top-6 -left-6 w-28 h-28 rounded-3xl border-2 border-purple-200/70" />
                </div>
              </Reveal>

              <div>
                <Reveal>
                  <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-4">
                    <span className="w-8 h-px bg-purple-300" />
                    {fr ? "Notre histoire" : "Our story"}
                  </span>
                </Reveal>
                <Reveal delay={70}>
                  <h2 className="text-3xl sm:text-[2.6rem] font-bold tracking-tight text-gray-900 leading-tight mb-5">
                    {fr ? (
                      <>Une conviction : un <span className="text-gradient-violet">accès fiable</span> aux meilleurs équipements</>
                    ) : (
                      <>One belief: <span className="text-gradient-violet">reliable access</span> to the best equipment</>
                    )}
                  </h2>
                </Reveal>
                <Reveal delay={140}>
                  <div className="space-y-4 text-gray-500 leading-relaxed">
                    <p>
                      {fr
                        ? "VIOLETTE MEDICAL DISTRIBUTION+ est née de la volonté d'offrir aux professionnels de santé tunisiens un accès simple et fiable aux dispositifs médicaux respiratoires de référence mondiale."
                        : "VIOLETTE MEDICAL DISTRIBUTION+ was born from the ambition to give Tunisian healthcare professionals simple, reliable access to world-class respiratory medical devices."}
                    </p>
                    <p>
                      {fr
                        ? "En devenant le représentant officiel et exclusif de Yuwell en Tunisie, nous avons fait le choix de l'exigence : des produits authentiques, certifiés et garantis, accompagnés d'une expertise technique de proximité."
                        : "By becoming the official and exclusive Yuwell representative in Tunisia, we chose high standards: authentic, certified and warranted products, backed by close technical expertise."}
                    </p>
                    <p>
                      {fr
                        ? "Aujourd'hui, nous accompagnons cliniques, pharmacies, prestataires de santé à domicile et revendeurs, avec une gamme complète : concentrateurs d'oxygène, CPAP, VNI, masques et accessoires."
                        : "Today we support clinics, pharmacies, home-care providers and resellers, with a complete range: oxygen concentrators, CPAP, NIV, masks and accessories."}
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={220}>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 pt-7 border-t border-gray-100">
                    {certifications.map((cert) => (
                      <div key={cert} className="flex items-center gap-2 text-gray-500">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{cert}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- Stats band (light, gridded) */}
        <Reveal>
          <section className="relative overflow-hidden bg-gray-50/70 border-y border-gray-100">
            <div className="absolute inset-0 bg-grid-light opacity-50 pointer-events-none" />
            <div className="absolute -top-24 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-gray-200">
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-4xl sm:text-5xl font-bold text-purple-700 mb-1.5">
                      <CountUp value={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ---------------------------------------------------- Mission / Vision / Values (white) */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Reveal>
                <span className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-4">
                  <span className="w-8 h-px bg-purple-300" />
                  {fr ? "Ce qui nous guide" : "What guides us"}
                  <span className="w-8 h-px bg-purple-300" />
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-3xl sm:text-[2.6rem] font-bold tracking-tight text-gray-900 leading-tight mb-4">
                  {fr ? (
                    <>Une mission, une vision, des <span className="text-gradient-violet">valeurs</span></>
                  ) : (
                    <>A mission, a vision, <span className="text-gradient-violet">values</span></>
                  )}
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-gray-500 text-lg leading-relaxed">{t.about.description}</p>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <Reveal key={i} delay={i * 120}>
                  <div className="group h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 transition-all duration-300">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-gradient-to-b group-hover:from-purple-600 group-hover:to-purple-700 group-hover:text-white transition-all duration-300">
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-[15px]">{f.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- Why choose us (tinted band) */}
        <section className="relative py-16 lg:py-24 bg-gray-50/70 overflow-hidden">
          <div className="absolute inset-0 bg-grid-light opacity-50 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <Reveal>
                  <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-4">
                    <span className="w-8 h-px bg-purple-300" />
                    {fr ? "Pourquoi nous choisir" : "Why choose us"}
                  </span>
                </Reveal>
                <Reveal delay={70}>
                  <h2 className="text-3xl sm:text-[2.6rem] font-bold tracking-tight text-gray-900 leading-tight mb-8">
                    {fr ? (
                      <>Un partenaire, pas seulement un <span className="text-gradient-violet">fournisseur</span></>
                    ) : (
                      <>A partner, not just a <span className="text-gradient-violet">supplier</span></>
                    )}
                  </h2>
                </Reveal>
                <div className="space-y-5">
                  {commitments.map((c, i) => (
                    <Reveal key={c.title} delay={140 + i * 90}>
                      <div className="flex gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-600 transition-colors duration-300">
                          <svg className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 mb-0.5">{c.title}</p>
                          <p className="text-sm text-gray-500 leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <Reveal variant="right" delay={100} className="order-1 lg:order-2">
                <div className="relative">
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/15 ring-1 ring-gray-900/5">
                    <Image src={TEAM_PRESENTING} alt={fr ? "Notre équipe en démonstration" : "Our team demonstrating"} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950/70 to-transparent pt-16 pb-5 px-6">
                      <p className="text-white font-semibold text-sm drop-shadow">
                        {fr ? "Démonstrations & conseils sur nos stands" : "Demonstrations & advice at our stands"}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block absolute -z-10 -bottom-6 -right-6 w-32 h-32 rounded-3xl bg-purple-100/70" />
                  <div className="hidden sm:block absolute -z-10 -top-6 -left-6 w-24 h-24 rounded-3xl border-2 border-purple-200/70" />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- Field presence gallery (white) */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <Reveal>
                <span className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-4">
                  <span className="w-8 h-px bg-purple-300" />
                  {fr ? "Sur le terrain" : "In the field"}
                  <span className="w-8 h-px bg-purple-300" />
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-3xl sm:text-[2.6rem] font-bold tracking-tight text-gray-900 leading-tight mb-4">
                  {fr ? (
                    <>Présents auprès des <span className="text-gradient-violet">soignants</span></>
                  ) : (
                    <>Present alongside <span className="text-gradient-violet">caregivers</span></>
                  )}
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-gray-500 text-lg leading-relaxed">
                  {fr
                    ? "Salons médicaux, formations et démonstrations : nous allons à la rencontre des professionnels de santé pour partager notre expertise."
                    : "Medical fairs, training and demonstrations: we meet healthcare professionals to share our expertise."}
                </p>
              </Reveal>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {gallery.map((g, i) => (
                <Reveal key={g.src} delay={i * 80}>
                  <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 ring-1 ring-gray-900/5 transition-all duration-300">
                    <Image src={g.src} alt={fr ? g.labelFr : g.labelEn} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950/75 via-gray-950/20 to-transparent pt-14 pb-4 px-4">
                      <p className="text-white font-semibold text-xs sm:text-sm drop-shadow flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                        {fr ? g.labelFr : g.labelEn}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- Yuwell partnership (dark, landing style) */}
        <section className="py-8 lg:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal variant="scale">
              <div className="relative overflow-hidden bg-gray-950 rounded-3xl sm:rounded-[2rem] ring-1 ring-white/10 shadow-2xl shadow-purple-900/25">
                <div className="absolute -top-24 right-1/3 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-grid-light opacity-[0.06] pointer-events-none" />

                <div className="relative grid grid-cols-1 lg:grid-cols-2 items-stretch">
                  <div className="p-8 sm:p-10 lg:p-12 order-2 lg:order-1">
                    <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-300 mb-4">
                      <span className="w-8 h-px bg-purple-400/60" />
                      {fr ? "Partenariat exclusif" : "Exclusive partnership"}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight mb-4">
                      {fr ? (
                        <>Représentant officiel <span className="text-purple-300">Yuwell</span> en Tunisie</>
                      ) : (
                        <>Official <span className="text-purple-300">Yuwell</span> representative in Tunisia</>
                      )}
                    </h2>
                    <p className="text-gray-400 leading-relaxed mb-7">
                      {fr
                        ? "Yuwell est l'un des plus grands fabricants mondiaux de dispositifs médicaux, présent dans plus de 110 pays avec plus de 30 ans d'innovation. Ce partenariat nous permet de garantir l'authenticité des produits, le support du constructeur et la continuité de l'approvisionnement."
                        : "Yuwell is one of the world's largest medical-device manufacturers, present in over 110 countries with more than 30 years of innovation. This partnership lets us guarantee product authenticity, manufacturer support and supply continuity."}
                    </p>
                    <div className="inline-flex items-center gap-4 bg-white rounded-2xl px-6 py-4 mb-7">
                      <Image src="/Yuwell.webp" alt="Yuwell" width={120} height={40} className="h-9 w-auto object-contain" />
                      <div className="w-px h-8 bg-gray-200" />
                      <p className="text-xs text-gray-500 leading-snug max-w-[160px]">Yuwell Medical Technology</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 pt-6 border-t border-white/10">
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

                  <div className="relative order-1 lg:order-2 min-h-[260px] lg:min-h-0">
                    <Image src={BOOTH_YUWELL} alt={fr ? "Stand Yuwell" : "Yuwell stand"} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------------- CTA (landing CtaBand style) */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal variant="scale">
              <div className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] bg-gradient-to-br from-purple-700 via-purple-800 to-gray-950 shadow-2xl shadow-purple-900/40 ring-1 ring-white/10 px-6 py-10 sm:px-14 sm:py-14">
                <div className="absolute -top-24 right-1/3 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-grid-light opacity-[0.07] pointer-events-none" />
                <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border-[28px] border-white/5 pointer-events-none" />

                <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] items-center gap-8">
                  <div className="max-w-2xl min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight mb-3">
                      {fr ? (
                        <>
                          Travaillons{" "}
                          <span className="relative whitespace-nowrap">
                            ensemble
                            <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                              <path d="M2 7C50 2 150 2 198 7" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                            </svg>
                          </span>
                        </>
                      ) : (
                        <>
                          Let&apos;s work{" "}
                          <span className="relative whitespace-nowrap">
                            together
                            <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 200 9" fill="none" preserveAspectRatio="none">
                              <path d="M2 7C50 2 150 2 198 7" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                            </svg>
                          </span>
                        </>
                      )}
                    </h2>
                    <p className="text-purple-200/90 leading-relaxed">
                      {fr
                        ? "Découvrez notre gamme ou contactez notre équipe pour un accompagnement personnalisé et un devis adapté à vos besoins."
                        : "Explore our range or contact our team for personalised support and a quote tailored to your needs."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3.5 [&>a]:w-full sm:[&>a]:w-auto">
                    <Link href="/products" className="btn-light btn-lg group">
                      {t.products.viewAll}
                      <svg className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <Link href="/contact" className="btn-outline-light btn-lg">
                      {t.nav.contact}
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
