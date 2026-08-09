"use client";

import { useState, FormEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/motion/Reveal";

export default function Contact() {
  const { t, language } = useLanguage();
  const fr = language === "fr";
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState("");

  const contactInfo = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: t.contact.address.title,
      value: t.contact.address.value,
      href: "https://www.google.com/maps/search/?api=1&query=35.734867,10.5740649",
      external: true,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: t.contact.phone.title,
      value: t.contact.phone.value,
      href: "tel:+21655820000",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: t.contact.email.title,
      value: t.contact.email.value,
      href: "mailto:Direction@violettemedical.com",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t.contact.hours.title,
      value: t.contact.hours.value,
    },
  ];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      subject: (formData.get("subject") as string) || null,
      message: formData.get("message") as string,
    };

    try {
      const dbRes = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!dbRes.ok) {
        const data = await dbRes.json();
        setError(data.error || (fr ? "Une erreur est survenue." : "An error occurred."));
        setSubmitting(false);
        return;
      }

      fetch("https://formspree.io/f/xykkznyg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      setSucceeded(true);
    } catch {
      setError(fr ? "Erreur de connexion. Réessayez." : "Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 focus:bg-white transition-all";

  return (
    <section id="contact" className="relative py-16 sm:py-20 lg:py-28 bg-gray-50/70 overflow-hidden">
      <div className="absolute inset-0 bg-grid-light opacity-50 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Info panel */}
          <Reveal variant="left" className="lg:col-span-2">
            <div className="relative overflow-hidden bg-gradient-to-b from-purple-700 to-purple-900 rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 text-white h-full shadow-2xl shadow-purple-900/25">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-200 mb-4">
                  <span className="w-8 h-px bg-purple-300/60" />
                  {fr ? "Contactez-nous" : "Get in touch"}
                </span>
                <h2 className="text-xl sm:text-3xl font-bold tracking-tight leading-tight mb-3">
                  {fr ? "Parlons de votre projet" : "Let's talk about your project"}
                </h2>
                <p className="text-purple-200 text-sm leading-relaxed mb-9">
                  {fr
                    ? "Devis, disponibilité, création de compte professionnel — notre équipe vous répond sous 24 h ouvrées."
                    : "Quotes, availability, professional account creation — our team replies within 24 business hours."}
                </p>

                <div className="space-y-5">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-purple-100">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-purple-300 text-xs uppercase tracking-wider font-semibold mb-1">{item.title}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            {...("external" in item && item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="text-[15px] font-medium hover:text-purple-200 transition-colors break-words"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-[15px] font-medium break-words">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

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
          </Reveal>

          {/* Form */}
          <Reveal variant="right" delay={120} className="lg:col-span-3">
            <div className="bg-white rounded-3xl sm:rounded-[2rem] border border-gray-100 shadow-xl shadow-purple-900/5 p-6 sm:p-8 lg:p-10 h-full">
              {succeeded ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {fr ? "Message envoyé avec succès !" : "Message sent successfully!"}
                  </p>
                  <p className="text-gray-500">
                    {fr ? "Nous vous répondrons dans les plus brefs délais." : "We'll get back to you soon."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t.contact.form.name} <span className="text-purple-600">*</span>
                      </label>
                      <input type="text" id="name" name="name" className={inputClass} required />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t.contact.form.email} <span className="text-purple-600">*</span>
                      </label>
                      <input type="email" id="email" name="email" className={inputClass} required />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t.contact.form.phone}
                      </label>
                      <input type="tel" id="phone" name="phone" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                        {fr ? "Sujet" : "Subject"}
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        className={inputClass}
                        placeholder={fr ? "De quoi s'agit-il ?" : "What is this about?"}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t.contact.form.message} <span className="text-purple-600">*</span>
                    </label>
                    <textarea id="message" name="message" rows={5} className={`${inputClass} resize-none`} required />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={submitting} className="btn-primary btn-lg w-full">
                    {submitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {fr ? "Envoi en cours..." : "Sending..."}
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
    </section>
  );
}
