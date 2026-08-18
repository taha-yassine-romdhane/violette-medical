"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useQuoteCart } from "@/context/QuoteCartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 focus:bg-white transition-all";

export default function DevisPage() {
  const { language, t } = useLanguage();
  const fr = language === "fr";
  const { items, count, setQty, remove, clear } = useQuoteCart();
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState("");

  const getName = (i: { nameFr: string; nameEn: string }) =>
    fr ? i.nameFr : i.nameEn || i.nameFr;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      company: (formData.get("company") as string) || null,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: (formData.get("message") as string) || null,
      items: items.map((i) => ({ id: i.id, nameFr: i.nameFr, reference: i.reference, qty: i.qty })),
    };

    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (fr ? "Une erreur est survenue." : "An error occurred."));
        setSubmitting(false);
        return;
      }

      // Email notification — same channel as the contact form (fire and forget)
      fetch("https://formspree.io/f/xykkznyg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          subject: `Demande de devis — ${items.length} produit${items.length > 1 ? "s" : ""}`,
          message: data.body,
        }),
      }).catch(() => {});

      setSucceeded(true);
      clear();
    } catch {
      setError(fr ? "Erreur de connexion. Réessayez." : "Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Breadcrumb + title */}
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3 sm:mb-5">
            <Link href="/" className="hover:text-gray-900 transition-colors">{t.nav.home}</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-900 font-medium">{fr ? "Demande de devis" : "Quote request"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-1.5">
            {fr ? "Ma demande de" : "My quote"}{" "}
            <span className="text-gradient-violet">{fr ? "devis" : "request"}</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mb-7 sm:mb-9 max-w-2xl">
            {fr
              ? "Vérifiez vos produits, indiquez vos coordonnées — notre équipe vous répond avec un devis personnalisé sous 24 h ouvrées."
              : "Review your products, leave your details — our team replies with a personalised quote within 24 business hours."}
          </p>

          {succeeded ? (
            /* ---------------------------------------------- Success state */
            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {fr ? "Demande envoyée !" : "Request sent!"}
              </h2>
              <p className="text-gray-500 mb-8">
                {fr
                  ? "Merci ! Notre équipe commerciale prépare votre devis et vous recontacte très vite par email ou téléphone."
                  : "Thank you! Our sales team is preparing your quote and will get back to you shortly by email or phone."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/products" className="btn-primary btn-md">
                  {fr ? "Continuer ma visite" : "Keep browsing"}
                </Link>
                <Link href="/" className="btn-outline btn-md">
                  {fr ? "Retour à l'accueil" : "Back to home"}
                </Link>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* ---------------------------------------------- Empty state */
            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
              <svg className="w-14 h-14 mx-auto text-gray-200 mb-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {fr ? "Votre demande est vide" : "Your request is empty"}
              </h2>
              <p className="text-gray-500 text-sm mb-7">
                {fr
                  ? "Parcourez nos produits et ajoutez ceux qui vous intéressent — sans engagement."
                  : "Browse our products and add the ones you're interested in — no commitment."}
              </p>
              <Link href="/products" className="btn-primary btn-md">
                {fr ? "Voir les produits" : "Browse products"}
              </Link>
            </div>
          ) : (
            /* ---------------------------------------------- Cart + form */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
              {/* Items */}
              <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
                  <p className="font-bold text-gray-900 text-sm sm:text-base">
                    {fr ? "Produits" : "Products"}{" "}
                    <span className="text-gray-400 font-semibold">({count})</span>
                  </p>
                  <button
                    onClick={clear}
                    className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {fr ? "Tout retirer" : "Clear all"}
                  </button>
                </div>

                <div className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4">
                      {/* Thumb */}
                      <Link href={`/products/${item.slug}`} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={getName(item)} width={64} height={64} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </Link>

                      {/* Name + ref */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`} className="block text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:underline">
                          {getName(item)}
                        </Link>
                        {item.reference && (
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">REF: {item.reference}</p>
                        )}
                      </div>

                      {/* Qty stepper */}
                      <div className="flex items-center border border-gray-200 rounded-xl bg-white shrink-0">
                        <button
                          onClick={() => setQty(item.id, item.qty - 1)}
                          aria-label="-"
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-l-xl transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 sm:w-9 text-center text-sm font-semibold text-gray-900 tabular-nums">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.id, item.qty + 1)}
                          aria-label="+"
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-xl transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => remove(item.id)}
                        aria-label={fr ? "Retirer" : "Remove"}
                        className="w-8 h-8 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L5.772 5.79m13.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="px-4 sm:px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {fr
                      ? "Les tarifs professionnels seront précisés dans votre devis."
                      : "Professional pricing will be detailed in your quote."}
                  </p>
                  <Link href="/products" className="text-xs font-semibold text-gray-700 hover:text-gray-900 whitespace-nowrap transition-colors">
                    + {fr ? "Ajouter d'autres produits" : "Add more products"}
                  </Link>
                </div>
              </div>

              {/* Contact form */}
              <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4 lg:sticky lg:top-24">
                <p className="font-bold text-gray-900 text-sm sm:text-base">
                  {fr ? "Vos coordonnées" : "Your details"}
                </p>

                <div>
                  <label htmlFor="devis-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {fr ? "Nom complet" : "Full name"} <span className="text-gray-900">*</span>
                  </label>
                  <input id="devis-name" name="name" type="text" required className={inputClass} placeholder="Dr. Ahmed Ben Ali" />
                </div>

                <div>
                  <label htmlFor="devis-company" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {fr ? "Société / Établissement" : "Company / Facility"}
                  </label>
                  <input id="devis-company" name="company" type="text" className={inputClass} placeholder={fr ? "Clinique, pharmacie, revendeur..." : "Clinic, pharmacy, reseller..."} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="devis-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-gray-900">*</span>
                    </label>
                    <input id="devis-email" name="email" type="email" required className={inputClass} placeholder={fr ? "votre@email.com" : "your@email.com"} />
                  </div>
                  <div>
                    <label htmlFor="devis-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {fr ? "Téléphone" : "Phone"} <span className="text-gray-900">*</span>
                    </label>
                    <input id="devis-phone" name="phone" type="tel" required className={inputClass} placeholder="+216 XX XXX XXX" />
                  </div>
                </div>

                <div>
                  <label htmlFor="devis-message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {fr ? "Message (optionnel)" : "Message (optional)"}
                  </label>
                  <textarea
                    id="devis-message"
                    name="message"
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder={fr ? "Quantités importantes, délais, questions..." : "Large quantities, deadlines, questions..."}
                  />
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
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {fr ? "Envoi en cours..." : "Sending..."}
                    </>
                  ) : (
                    <>
                      {fr ? "Envoyer ma demande de devis" : "Send my quote request"}
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-gray-400 leading-relaxed text-center">
                  {fr
                    ? "Sans engagement. Réponse sous 24 h ouvrées."
                    : "No commitment. Reply within 24 business hours."}
                </p>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
