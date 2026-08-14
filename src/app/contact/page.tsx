"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || null,
      subject: (fd.get("subject") as string) || null,
      message: fd.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || (language === "fr" ? "Une erreur est survenue." : "An error occurred."));
      } else {
        setSucceeded(true);
        fetch("https://formspree.io/f/xykkznyg", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        }).catch(() => {});
      }
    } catch {
      setError(language === "fr" ? "Erreur de connexion." : "Connection error.");
    } finally {
      setSubmitting(false);
    }
  }

  const contactInfo = [
    { icon: "location", title: t.contact.address.title, value: t.contact.address.value, href: "https://www.google.com/maps/search/?api=1&query=35.734867,10.5740649", external: true },
    { icon: "phone", title: t.contact.phone.title, value: t.contact.phone.value, href: "tel:+21655820000" },
    { icon: "email", title: t.contact.email.title, value: t.contact.email.value, href: "mailto:Direction@violettemedical.com" },
    { icon: "clock", title: t.contact.hours.title, value: t.contact.hours.value },
  ];

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 focus:bg-white transition-all";

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-white">
        {/* Page hero */}
        <div className="relative bg-white border-b border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none" />
          <div className="absolute -top-24 right-1/4 w-[420px] h-[420px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3 sm:mb-5">
              <Link href="/" className="hover:text-purple-700 transition-colors">{t.nav.home}</Link>
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              <span className="text-gray-900 font-medium">{t.nav.contact}</span>
            </div>
            <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-2 sm:mb-4">
              <span className="w-8 h-px bg-purple-300" />
              {language === "fr" ? "Contactez-nous" : "Get in touch"}
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-2 sm:mb-3">{t.contact.title}</h1>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl">{t.contact.subtitle}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact info */}
            <Reveal variant="left" className="lg:col-span-2">
              <div className="relative overflow-hidden bg-gradient-to-b from-purple-700 to-purple-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-purple-900/25">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <h2 className="text-lg font-bold tracking-tight mb-1.5">VIOLETTE MEDICAL DISTRIBUTION+</h2>
                  <p className="text-purple-200 text-sm mb-8">
                    {language === "fr"
                      ? "Représentant officiel Yuwell en Tunisie"
                      : "Official Yuwell representative in Tunisia"}
                  </p>
                  <div className="space-y-6">
                    {contactInfo.map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 text-purple-100">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            {item.icon === "location" && <><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>}
                            {item.icon === "phone" && <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />}
                            {item.icon === "email" && <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
                            {item.icon === "clock" && <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-purple-300 text-xs uppercase tracking-wider font-semibold mb-1">{item.title}</p>
                          {item.href ? (
                            <a
                              href={item.href}
                              {...("external" in item && item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                              className="text-[15px] font-medium hover:text-purple-200 transition-colors break-words"
                            >{item.value}</a>
                          ) : (
                            <p className="text-[15px] font-medium break-words">{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Social */}
                  <div className="mt-9 pt-7 border-t border-white/15 flex gap-3">
                    <a
                      href="https://www.facebook.com/profile.php?id=61581424160086"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors"
                    >
                      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/violette_distr_plus/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors"
                    >
                      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Become a client */}
              <div className="mt-6 bg-purple-50 border border-purple-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  {language === "fr" ? "Devenir client" : "Become a client"}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {language === "fr"
                    ? "Vous êtes un professionnel de santé ? Remplissez le formulaire ci-contre en indiquant votre intérêt et un commercial vous contactera pour créer votre compte."
                    : "Are you a healthcare professional? Fill out the form indicating your interest and a sales representative will contact you to create your account."}
                </p>
              </div>
            </Reveal>

            {/* Form */}
            <Reveal variant="right" delay={120} className="lg:col-span-3">
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-purple-900/5 p-8 lg:p-10">
                {succeeded ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {language === "fr" ? "Message envoyé !" : "Message sent!"}
                    </p>
                    <p className="text-gray-500 mb-6">
                      {language === "fr" ? "Nous vous répondrons dans les plus brefs délais." : "We'll get back to you as soon as possible."}
                    </p>
                    <button onClick={() => setSucceeded(false)} className="text-sm text-purple-700 hover:text-purple-900 font-semibold transition-colors">
                      {language === "fr" ? "Envoyer un autre message" : "Send another message"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t.contact.form.name} <span className="text-purple-600">*</span>
                      </label>
                      <input type="text" name="name" required className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t.contact.form.email} <span className="text-purple-600">*</span>
                        </label>
                        <input type="email" name="email" required className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.contact.form.phone}</label>
                        <input type="tel" name="phone" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{language === "fr" ? "Sujet" : "Subject"}</label>
                      <select name="subject" className={inputClass}>
                        <option value="">{language === "fr" ? "Choisir un sujet..." : "Choose a subject..."}</option>
                        <option value="Demande de devis">{language === "fr" ? "Demande de devis" : "Quote request"}</option>
                        <option value="Devenir client">{language === "fr" ? "Devenir client" : "Become a client"}</option>
                        <option value="Information produit">{language === "fr" ? "Information produit" : "Product information"}</option>
                        <option value="Support technique">{language === "fr" ? "Support technique" : "Technical support"}</option>
                        <option value="Autre">{language === "fr" ? "Autre" : "Other"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t.contact.form.message} <span className="text-purple-600">*</span>
                      </label>
                      <textarea name="message" rows={5} required className={`${inputClass} resize-none`} />
                    </div>
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
                    )}
                    <button type="submit" disabled={submitting} className="btn-primary btn-lg w-full">
                      {submitting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {language === "fr" ? "Envoi..." : "Sending..."}
                        </>
                      ) : (
                        t.contact.form.submit
                      )}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
