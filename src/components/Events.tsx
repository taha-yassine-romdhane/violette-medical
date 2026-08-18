"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

interface EventData {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  location: string;
  date: string;
  images: string[];
  thumbnail: string | null;
  isFeatured: boolean;
}

export default function Events() {
  const { t, language } = useLanguage();
  const fr = language === "fr";
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data: EventData[]) => setEvents(data.slice(0, 3)))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  if (!loading && events.length === 0) return null;

  return (
    <section id="events" className="relative py-12 sm:py-20 lg:py-28 bg-gray-50/70 overflow-hidden">
      <div className="absolute inset-0 bg-grid-light opacity-50 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5 sm:gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl">
            <Reveal>
              <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 mb-4">
                <span className="w-8 h-px bg-purple-300" />
                {fr ? "Actualités" : "News"}
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-[1.75rem] sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-gray-900 leading-tight">
                {fr ? "Nos derniers" : "Our latest"}{" "}
                <span className="text-gradient-violet">{fr ? "événements" : "events"}</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <Link href="/events" className="btn-outline btn-md group">
              {fr ? "Tous les événements" : "All events"}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </Reveal>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-[78vw] max-w-[320px] sm:w-auto sm:max-w-none bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-5 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))
            : events.map((event, i) => {
                const image = event.thumbnail || event.images[0];
                const title = fr ? event.titleFr : event.titleEn;
                const desc = fr ? event.descriptionFr : event.descriptionEn;
                return (
                  <Reveal key={event.id} delay={i * 110} className="h-full snap-start shrink-0 w-[78vw] max-w-[320px] sm:w-auto sm:max-w-none">
                    <Link
                      href="/events"
                      className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1.5 overflow-hidden transition-all duration-300"
                    >
                      {image && (
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image
                            src={image}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-[1.06] transition-transform duration-500"
                          />
                          {event.isFeatured && (
                            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-900 ring-1 ring-gray-900/10 shadow-sm text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {fr ? "En vedette" : "Featured"}
                            </span>
                          )}
                          {event.images.length > 1 && (
                            <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 ring-1 ring-gray-900/10 shadow-sm text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {event.images.length}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(event.date)}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{desc}</p>
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-purple-600 group-hover:gap-2.5 transition-all">
                          {fr ? "Voir la galerie" : "View gallery"}
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
        </div>
      </div>
    </section>
  );
}
