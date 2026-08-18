"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer({ overlap = false }: { overlap?: boolean }) {
  const { t, language } = useLanguage();
  const fr = language === "fr";

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/about", label: t.nav.about },
    { href: "/catalogue", label: t.nav.catalogue },
    { href: "/events", label: t.nav.events },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <footer className="relative bg-gray-950 text-white overflow-hidden">
      {/* Ambient glow + grid */}
      <div className="absolute -top-32 left-1/3 w-[480px] h-[480px] bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-grid-light opacity-[0.05] pointer-events-none" />

      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 ${overlap ? "pt-32 sm:pt-44" : "pt-14 sm:pt-16"}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Company Info */}
          <div>
            <Image
              src="/logo.PNG"
              alt="Violette Medical Distribution"
              width={180}
              height={50}
              className="h-11 w-auto mb-6 brightness-0 invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t.footer.description}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61581424160086"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-300 hover:bg-purple-600 hover:border-purple-600 hover:text-white hover:-translate-y-0.5 transition-all duration-200"
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
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-300 hover:bg-purple-600 hover:border-purple-600 hover:text-white hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4 sm:mb-6">
              {t.footer.quickLinks}
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-1 sm:gap-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-purple-500 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4 sm:mb-6">
              {t.footer.contactInfo}
            </h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-4.5 h-4.5 mt-0.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=35.734867,10.5740649"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t.contact.address.value}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4.5 h-4.5 mt-0.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+21655820000" className="hover:text-white transition-colors">
                  {t.contact.phone.value}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4.5 h-4.5 mt-0.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:Direction@violettemedical.com" className="hover:text-white transition-colors">
                  {t.contact.email.value}
                </a>
              </li>
            </ul>
          </div>

          {/* Partnership */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4 sm:mb-6">
              {fr ? "Partenaire Officiel" : "Official Partner"}
            </h3>
            <div className="bg-white rounded-xl p-4 inline-block">
              <Image
                src="/Yuwell.webp"
                alt="Yuwell - Official Partner"
                width={150}
                height={50}
                className="h-9 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              {fr
                ? "Représentant officiel et exclusif de Yuwell en Tunisie"
                : "Official and exclusive Yuwell representative in Tunisia"}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {["CE", "FDA", "ISO 13485"].map((cert) => (
                <span key={cert} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-gray-300 text-xs font-medium">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 sm:mt-14 pt-7 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-gray-500 text-xs sm:text-sm text-center md:text-left">
          <p>
            &copy; {currentYear} VIOLETTE MEDICAL DISTRIBUTION+. {t.footer.rights}
          </p>
          <p className="flex items-center gap-1.5">
            {fr ? "Partenaire officiel" : "Official partner"}
            <span className="text-gray-300 font-semibold">Yuwell</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
