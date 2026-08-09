"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { translations, Language, TranslationKeys } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  /** Increments on each language switch — use as a React key to re-trigger animations */
  langKey: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");
  const [langKey, setLangKey] = useState(0);
  const initialRef = useRef(true);

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "fr" || savedLang === "en")) {
      setLanguage(savedLang);
    }
    initialRef.current = false;
  }, []);

  const handleSetLanguage = (lang: Language) => {
    if (lang === language) return;
    setLanguage(lang);
    setLangKey((k) => k + 1);
    localStorage.setItem("language", lang);
    // Soft cross-fade of the whole page when the language changes
    document.body.classList.remove("lang-fade");
    void document.body.offsetWidth; // restart the animation if switching quickly
    document.body.classList.add("lang-fade");
    window.setTimeout(() => document.body.classList.remove("lang-fade"), 400);
  };

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language] as TranslationKeys,
    langKey,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
