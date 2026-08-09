"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    "w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all";

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
              <span className="text-white font-medium">{t.nav.contact}</span>
            </div>
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 bg-purple-500/10 border border-purple-400/20 rounded-full px-4 py-1.5 mb-4">
              {language === "fr" ? "Contactez-nous" : "Get in touch"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">{t.contact.title}</h1>
            <p className="text-gray-400 text-lg max-w-2xl">{t.contact.subtitle}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact info */}
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden bg-gray-900 border border-white/10 rounded-3xl p-8 text-white">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-700/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <h2 className="text-lg font-bold tracking-tight mb-1.5">VIOLETTE MEDICAL DISTRIBUTION+</h2>
                  <p className="text-gray-400 text-sm mb-8">
                    {language === "fr"
                      ? "Représentant officiel Yuwell en Tunisie"
                      : "Official Yuwell representative in Tunisia"}
                  </p>
                  <div className="space-y-6">
                    {contactInfo.map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 text-purple-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            {item.icon === "location" && <><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>}
                            {item.icon === "phone" && <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />}
                            {item.icon === "email" && <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
                            {item.icon === "clock" && <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">{item.title}</p>
                          {item.href ? (
                            <a
                              href={item.href}
                              {...("external" in item && item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                              className="text-[15px] font-medium hover:text-purple-300 transition-colors break-words"
                            >{item.value}</a>
                          ) : (
                            <p className="text-[15px] font-medium break-words">{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Become a client */}
              <div className="mt-6 bg-purple-500/10 border border-purple-400/20 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-2">
                  {language === "fr" ? "Devenir client" : "Become a client"}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {language === "fr"
                    ? "Vous êtes un professionnel de santé ? Remplissez le formulaire ci-contre en indiquant votre intérêt et un commercial vous contactera pour créer votre compte."
                    : "Are you a healthcare professional? Fill out the form indicating your interest and a sales representative will contact you to create your account."}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white/[0.03] rounded-3xl border border-white/10 p-8 lg:p-10">
                {succeeded ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-white mb-2">
                      {language === "fr" ? "Message envoyé !" : "Message sent!"}
                    </p>
                    <p className="text-gray-400 mb-6">
                      {language === "fr" ? "Nous vous répondrons dans les plus brefs délais." : "We'll get back to you as soon as possible."}
                    </p>
                    <button onClick={() => setSucceeded(false)} className="text-sm text-purple-300 hover:text-purple-200 font-medium transition-colors">
                      {language === "fr" ? "Envoyer un autre message" : "Send another message"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        {t.contact.form.name} <span className="text-purple-400">*</span>
                      </label>
                      <input type="text" name="name" required className={inputClass} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                          {t.contact.form.email} <span className="text-purple-400">*</span>
                        </label>
                        <input type="email" name="email" required className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">{t.contact.form.phone}</label>
                        <input type="tel" name="phone" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">{language === "fr" ? "Sujet" : "Subject"}</label>
                      <select name="subject" className={`${inputClass} [&>option]:bg-gray-900 [&>option]:text-white`}>
                        <option value="">{language === "fr" ? "Choisir un sujet..." : "Choose a subject..."}</option>
                        <option value="Demande de devis">{language === "fr" ? "Demande de devis" : "Quote request"}</option>
                        <option value="Devenir client">{language === "fr" ? "Devenir client" : "Become a client"}</option>
                        <option value="Information produit">{language === "fr" ? "Information produit" : "Product information"}</option>
                        <option value="Support technique">{language === "fr" ? "Support technique" : "Technical support"}</option>
                        <option value="Autre">{language === "fr" ? "Autre" : "Other"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        {t.contact.form.message} <span className="text-purple-400">*</span>
                      </label>
                      <textarea name="message" rows={5} required className={`${inputClass} resize-none`} />
                    </div>
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
