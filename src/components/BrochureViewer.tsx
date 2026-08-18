"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import type { Brochure } from "@/lib/brochures";

interface BrochureViewerProps {
  items: Brochure[];
  /** Index into `items`; null hides the viewer */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/** Fullscreen brochure (poster) viewer with prev/next, keyboard nav and download. */
export default function BrochureViewer({ items, index, onIndexChange, onClose }: BrochureViewerProps) {
  const { language } = useLanguage();
  const fr = language === "fr";

  const step = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndexChange((index + dir + items.length) % items.length);
    },
    [index, items.length, onIndexChange]
  );

  // Keyboard navigation + scroll lock while open
  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, onClose, step]);

  if (index === null) return null;
  const current = items[index];
  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-gray-950/90 backdrop-blur-sm flex flex-col animate-backdrop-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${current.model} — brochure`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm sm:text-base leading-tight truncate">{current.model}</p>
          <p className="text-gray-400 text-xs truncate">{fr ? current.subtitleFr : current.subtitleEn}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={current.poster}
            download
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">{fr ? "Télécharger" : "Download"}</span>
          </a>
          <button
            onClick={onClose}
            aria-label={fr ? "Fermer" : "Close"}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Poster */}
      <div className="relative flex-1 min-h-0 px-2 sm:px-16 pb-4">
        <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
          <Image
            src={current.poster}
            alt={`${current.model} — ${fr ? current.subtitleFr : current.subtitleEn}`}
            fill
            sizes="100vw"
            priority
            className="object-contain"
          />
        </div>

        {/* Prev / next */}
        {items.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label={fr ? "Précédent" : "Previous"}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label={fr ? "Suivant" : "Next"}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </div>

      {/* Counter */}
      <p className="text-center text-gray-400 text-xs pb-4 shrink-0" onClick={(e) => e.stopPropagation()}>
        {index + 1} / {items.length}
      </p>
    </div>
  );
}
