"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface EventData {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  location: string;
  date: string;
  endDate: string | null;
  images: string[];
  thumbnail: string | null;
  isActive: boolean;
  isFeatured: boolean;
}

const highlights = [
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    titleFr: "Salons professionnels",
    titleEn: "Trade shows",
    descFr: "Présence aux principaux salons médicaux en Tunisie et en Afrique du Nord",
    descEn: "Presence at major medical trade shows in Tunisia and North Africa",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    titleFr: "Formations",
    titleEn: "Training",
    descFr: "Sessions de formation pour les professionnels de santé sur nos équipements",
    descEn: "Training sessions for healthcare professionals on our equipment",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    titleFr: "Démonstrations",
    titleEn: "Demonstrations",
    descFr: "Démonstrations en direct de nos appareils respiratoires et dispositifs médicaux",
    descEn: "Live demonstrations of our respiratory devices and medical equipment",
  },
];

export default function EventsPage() {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data: EventData[]) => {
        setEvents(data);
      })
      .catch(() => {
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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
              <span className="text-white font-medium">{t.nav.events}</span>
            </div>
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 bg-purple-500/10 border border-purple-400/20 rounded-full px-4 py-1.5 mb-4">
              {language === "fr" ? "Actualités" : "News"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">{t.events.title}</h1>
            <p className="text-gray-400 text-lg max-w-2xl">{t.events.subtitle}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <p className="text-lg text-gray-400 max-w-3xl mb-10">{t.events.description}</p>

          {/* Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {highlights.map((h, i) => (
              <div key={i} className="bg-white/[0.04] rounded-2xl border border-white/10 hover:border-purple-400/40 hover:bg-white/[0.07] p-7 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-300 mb-5">
                  {h.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {language === "en" ? h.titleEn : h.titleFr}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {language === "en" ? h.descEn : h.descFr}
                </p>
              </div>
            ))}
          </div>

          {/* Events List */}
          <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
            {language === "fr" ? "Nos événements" : "Our events"}
          </h2>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/[0.04] rounded-2xl overflow-hidden border border-white/10 animate-pulse">
                  <div className="h-48 bg-white/10" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/5 rounded w-full" />
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.03] rounded-2xl border border-white/10">
              <svg className="w-16 h-16 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white text-xl font-semibold">
                {language === "fr" ? "Aucun événement pour le moment" : "No events at the moment"}
              </p>
              <p className="text-gray-400 mt-2">
                {language === "fr" ? "Revenez bientôt pour découvrir nos prochains événements" : "Check back soon for upcoming events"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const title = language === "en" ? event.titleEn : event.titleFr;
                const description = language === "en" ? event.descriptionEn : event.descriptionFr;
                const imageSrc = event.thumbnail || (event.images && event.images.length > 0 ? event.images[0] : null);
                const isExpanded = expandedEvent === event.id;

                return (
                  <div
                    key={event.id}
                    className={`bg-white/[0.04] rounded-2xl overflow-hidden border border-white/10 hover:border-purple-400/40 transition-all duration-300 ${
                      isExpanded ? "md:col-span-2 lg:col-span-3" : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    {imageSrc && (
                      <div
                        className="relative h-48 cursor-pointer overflow-hidden"
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      >
                        <Image
                          src={imageSrc}
                          alt={title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes={isExpanded ? "100vw" : "33vw"}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-950/60 to-transparent" />
                        {event.isFeatured && (
                          <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                            {language === "fr" ? "En vedette" : "Featured"}
                          </span>
                        )}
                        {event.images && event.images.length > 1 && (
                          <span className="absolute top-3 right-3 bg-gray-950/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {event.images.length}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-2">{description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {/* Date */}
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {formatDate(event.date)}
                            {event.endDate && ` - ${formatDate(event.endDate)}`}
                          </span>
                        </div>

                        {/* Location */}
                        {event.location && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {/* View gallery button */}
                      {event.images && event.images.length > 1 && (
                        <button
                          onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                          className="mt-4 text-sm text-purple-300 hover:text-purple-200 font-medium flex items-center gap-1 transition-colors"
                        >
                          {isExpanded
                            ? (language === "fr" ? "Masquer la galerie" : "Hide gallery")
                            : (language === "fr" ? "Voir la galerie" : "View gallery")
                          }
                          <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Expanded Gallery */}
                    {isExpanded && event.images && event.images.length > 0 && (
                      <div className="border-t border-white/10 p-5">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {event.images.map((img, i) => (
                            <div key={i} className="relative h-40 md:h-48 rounded-xl overflow-hidden border border-white/10">
                              <Image
                                src={img}
                                alt={`${title} - ${i + 1}`}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-500"
                                sizes="25vw"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
