export type FamilyKey = "oxygen" | "pap" | "mask";

export interface Brochure {
  id: string;
  model: string;
  family: FamilyKey;
  subtitleFr: string;
  subtitleEn: string;
  poster: string;
  /** Shown in the landing-page carousel */
  featured?: boolean;
}

export function familyLabel(family: FamilyKey, fr: boolean): string {
  switch (family) {
    case "oxygen":
      return fr ? "Concentrateurs d'Oxygène" : "Oxygen Concentrators";
    case "pap":
      return fr ? "CPAP & VNI" : "CPAP & NIV";
    case "mask":
      return fr ? "Masques" : "Masks";
  }
}

/* One-page product brochures (posters) shipped with the official catalogue. */
export const brochures: Brochure[] = [
  // Oxygen concentrators
  { id: "8f-5a", model: "8F-5A", family: "oxygen", subtitleFr: "Concentrateur d'Oxygène 5 L", subtitleEn: "Oxygen Concentrator 5 L", poster: "/catalogue-and-images/Oxygen Concentrator/8F-5A Poster.jpg", featured: true },
  { id: "8f-10", model: "8F-10", family: "oxygen", subtitleFr: "Concentrateur d'Oxygène 10 L", subtitleEn: "Oxygen Concentrator 10 L", poster: "/catalogue-and-images/Oxygen Concentrator/8F-10 Poster.jpg", featured: true },
  { id: "8f-10-dual", model: "8F-10 Dual Flow", family: "oxygen", subtitleFr: "Concentrateur 10 L double débit", subtitleEn: "Dual-flow 10 L concentrator", poster: "/catalogue-and-images/Oxygen Concentrator/8F-10 (Dual Flow) Poster.jpg" },
  { id: "9f-5b", model: "9F-5B", family: "oxygen", subtitleFr: "Concentrateur d'Oxygène 5 L", subtitleEn: "Oxygen Concentrator 5 L", poster: "/catalogue-and-images/Oxygen Concentrator/9F-5B Poster.jpg" },
  { id: "spirit-3", model: "Spirit-3", family: "oxygen", subtitleFr: "Concentrateur d'Oxygène", subtitleEn: "Oxygen Concentrator", poster: "/catalogue-and-images/Oxygen Concentrator/Spirit-3 Poster.jpg", featured: true },
  { id: "spirit-6", model: "Spirit-6", family: "oxygen", subtitleFr: "Concentrateur d'Oxygène", subtitleEn: "Oxygen Concentrator", poster: "/catalogue-and-images/Oxygen Concentrator/spirit-6 Poster.jpg" },
  // CPAP / VNI
  { id: "yh-350", model: "YH-350", family: "pap", subtitleFr: "CPAP / Auto-CPAP", subtitleEn: "CPAP / Auto-CPAP", poster: "/catalogue-and-images/PAP & Mask/YH350 Poster.jpg", featured: true },
  { id: "yh-550", model: "YH-550", family: "pap", subtitleFr: "Auto-CPAP", subtitleEn: "Auto-CPAP", poster: "/catalogue-and-images/PAP & Mask/YH550 Poster.jpg", featured: true },
  { id: "yh-820", model: "YH-820", family: "pap", subtitleFr: "VNI · BiPAP", subtitleEn: "NIV · BiPAP", poster: "/catalogue-and-images/PAP & Mask/YH820 Poster.jpg" },
  { id: "yh-825", model: "YH-825", family: "pap", subtitleFr: "VNI · BiPAP", subtitleEn: "NIV · BiPAP", poster: "/catalogue-and-images/PAP & Mask/YH825 Poster.jpg" },
  { id: "yh-830", model: "YH-830", family: "pap", subtitleFr: "VNI · BiPAP", subtitleEn: "NIV · BiPAP", poster: "/catalogue-and-images/PAP & Mask/YH830 Poster.jpg", featured: true },
  // Masks
  { id: "yf-01", model: "YF-01", family: "mask", subtitleFr: "Masque facial", subtitleEn: "Full-face mask", poster: "/catalogue-and-images/Mask/YF-01_poster.jpg", featured: true },
  { id: "yf-02", model: "YF-02", family: "mask", subtitleFr: "Masque facial", subtitleEn: "Full-face mask", poster: "/catalogue-and-images/Mask/YF-02_poster.jpg" },
  { id: "yf-03", model: "YF-03", family: "mask", subtitleFr: "Masque facial", subtitleEn: "Full-face mask", poster: "/catalogue-and-images/Mask/YF-03_poster.jpg" },
  { id: "yn-01", model: "YN-01", family: "mask", subtitleFr: "Masque nasal", subtitleEn: "Nasal mask", poster: "/catalogue-and-images/Mask/YN-01_poster.jpg" },
  { id: "yn-02", model: "YN-02", family: "mask", subtitleFr: "Masque nasal", subtitleEn: "Nasal mask", poster: "/catalogue-and-images/Mask/YN-02_poster.jpg", featured: true },
  { id: "yn-03", model: "YN-03", family: "mask", subtitleFr: "Masque nasal", subtitleEn: "Nasal mask", poster: "/catalogue-and-images/Mask/YN-03_poster.jpg" },
  { id: "yp-01", model: "YP-01", family: "mask", subtitleFr: "Masque narinaire", subtitleEn: "Nasal pillow mask", poster: "/catalogue-and-images/Mask/YP-01_poster.jpg" },
];
