"use client";

import { useLanguage } from "@/context/LanguageContext";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

export default function Process() {
  const { language } = useLanguage();
  const fr = language === "fr";

  const steps = [
    {
      title: fr ? "Demande de compte" : "Account request",
      text: fr
        ? "Contactez-nous : un commercial crée votre espace professionnel B2B."
        : "Contact us: a sales rep creates your professional B2B account.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      title: fr ? "Commande en ligne" : "Order online",
      text: fr
        ? "Consultez vos tarifs, composez votre panier et validez votre commande."
        : "See your prices, build your cart and confirm your order.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      ),
    },
    {
      title: fr ? "Préparation tracée" : "Traced preparation",
      text: fr
        ? "Chaque dispositif est identifié par son numéro de série avant expédition."
        : "Every device is identified by its serial number before shipping.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 12h.01M7 17h.01M11 7h6M11 12h6M11 17h6M5.2 3h13.6A2.2 2.2 0 0121 5.2v13.6a2.2 2.2 0 01-2.2 2.2H5.2A2.2 2.2 0 013 18.8V5.2A2.2 2.2 0 015.2 3z" />
        </svg>
      ),
    },
    {
      title: fr ? "Livraison & support" : "Delivery & support",
      text: fr
        ? "Livraison partout en Tunisie, formation et SAV constructeur inclus."
        : "Delivery across Tunisia, training and manufacturer support included.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-gray-50/70 overflow-hidden">
      <div className="absolute inset-0 bg-grid-light opacity-50 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={fr ? "Notre processus" : "Our process"}
          title={fr ? "Comment nous livrons" : "How we deliver"}
          accent={fr ? "l'excellence" : "excellence"}
          description={
            fr
              ? "Un parcours simple et tracé, de la création de votre compte à la mise en service de vos équipements."
              : "A simple, traceable journey from account creation to equipment commissioning."
          }
        />

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9 sm:gap-8 lg:gap-6">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[26px] left-[12%] right-[12%] h-px border-t-2 border-dashed border-purple-200" />

          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div className="relative text-center group px-2">
                <div className="relative inline-flex mb-5">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-white border border-purple-100 shadow-md shadow-purple-900/5 flex items-center justify-center text-purple-600 group-hover:bg-gradient-to-b group-hover:from-purple-600 group-hover:to-purple-700 group-hover:text-white group-hover:scale-110 transition-all duration-300 relative z-10">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full bg-gray-950 text-white text-[11px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-[13px] sm:text-sm text-gray-500 leading-relaxed max-w-[260px] mx-auto">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
