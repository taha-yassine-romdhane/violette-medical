"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/motion/Reveal";

export default function Faq() {
  const { language } = useLanguage();
  const fr = language === "fr";
  const [open, setOpen] = useState(0);

  const faqs = fr
    ? [
        {
          q: "Comment devenir client professionnel ?",
          a: "Remplissez le formulaire de contact en indiquant votre activité. Un commercial vous rappelle, vérifie votre statut de professionnel de santé et crée votre espace B2B avec vos tarifs.",
        },
        {
          q: "Vendez-vous aux particuliers ?",
          a: "Notre plateforme est dédiée à la vente en gros pour les professionnels : revendeurs, prestataires de santé à domicile, cliniques et pharmacies.",
        },
        {
          q: "Les produits sont-ils authentiques et garantis ?",
          a: "Oui. Nous sommes le représentant officiel Yuwell en Tunisie : chaque dispositif est authentique, certifié CE/FDA/ISO 13485, tracé par numéro de série et couvert par la garantie constructeur.",
        },
        {
          q: "Proposez-vous la formation sur les appareils ?",
          a: "Oui, la formation technique de vos équipes (CPAP, VNI, concentrateurs) et l'assistance après-vente sont incluses dans notre accompagnement.",
        },
        {
          q: "Quels sont les délais de livraison ?",
          a: "Les produits en stock sont expédiés sous 24 à 72 h partout en Tunisie. Pour les commandes importantes, votre commercial vous confirme un planning précis.",
        },
      ]
    : [
        {
          q: "How do I become a professional client?",
          a: "Fill in the contact form describing your activity. A sales rep calls you back, verifies your healthcare professional status and creates your B2B account with your prices.",
        },
        {
          q: "Do you sell to individuals?",
          a: "Our platform is dedicated to wholesale for professionals: resellers, home healthcare providers, clinics and pharmacies.",
        },
        {
          q: "Are the products authentic and under warranty?",
          a: "Yes. We are the official Yuwell representative in Tunisia: every device is authentic, CE/FDA/ISO 13485 certified, serial-number traced and covered by the manufacturer's warranty.",
        },
        {
          q: "Do you provide device training?",
          a: "Yes, technical training for your teams (CPAP, NIV, concentrators) and after-sales assistance are part of our support.",
        },
        {
          q: "What are the delivery times?",
          a: "In-stock products ship within 24–72h anywhere in Tunisia. For large orders, your sales rep confirms a precise schedule.",
        },
      ];

  return (
    <section className="py-12 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-7 lg:gap-16 items-start">
          {/* Left: heading + photo */}
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <Reveal>
              <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-4">
                <span className="w-8 h-px bg-purple-300" />
                FAQ
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-[1.75rem] sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-gray-900 leading-tight mb-5">
                {fr ? "Questions" : "Frequently asked"}{" "}
                <span className="text-gradient-violet">{fr ? "fréquentes" : "questions"}</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-[15px] sm:text-base text-gray-500 leading-relaxed mb-8">
                {fr
                  ? "Vous ne trouvez pas votre réponse ? Notre équipe vous répond rapidement."
                  : "Can't find your answer? Our team replies quickly."}
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-purple-900/10 ring-1 ring-gray-900/5 aspect-[4/3] hidden lg:block">
                <Image
                  src="/events/599942488_122121025365047472_4073525478158429045_n.jpg"
                  alt="Équipe Violette Medical"
                  fill
                  sizes="40vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950/70 to-transparent p-5 pt-14">
                  <p className="text-white text-sm font-semibold">
                    {fr ? "Une question ? Parlons-en." : "A question? Let's talk."}
                  </p>
                  <a href="tel:+21655820000" className="text-purple-200 text-xs hover:text-white transition-colors">
                    +216 55 820 000
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: accordion */}
          <div className="lg:col-span-3 space-y-3.5">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={faq.q} delay={i * 70}>
                  <div
                    className={`rounded-2xl border transition-all duration-300 ${
                      isOpen
                        ? "border-purple-200 bg-purple-50/50 shadow-md shadow-purple-900/5"
                        : "border-gray-100 bg-white hover:border-purple-100"
                    }`}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="w-full flex items-center justify-between gap-3 sm:gap-4 text-left px-5 sm:px-6 py-4 sm:py-5"
                    >
                      <span className="font-bold text-gray-900 text-sm sm:text-[15px] leading-snug">{faq.q}</span>
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isOpen ? "bg-purple-600 text-white rotate-180" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 sm:px-6 pb-5 text-[13px] sm:text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
