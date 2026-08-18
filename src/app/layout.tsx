import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { QuoteCartProvider } from "@/context/QuoteCartContext";
import SessionProvider from "@/components/auth/SessionProvider";
import DevTools from "@/components/DevTools";

const inter = Inter({
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://violettemedical.com";

// Self-hosted Umami analytics. Stays inert until the website is registered in
// the Umami dashboard and its id is set in .env — no id, no script, no request.
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const umamiSrc = "https://analytics.omedical-para.tn/script.js";
const siteTitle = "VIOLETTE MEDICAL DISTRIBUTION+ | Représentant Yuwell en Tunisie";
const siteDescription =
  "Représentant officiel de la gamme respiratoire Yuwell en Tunisie. Vente en gros : CPAP, VNI (BiPAP), Concentrateurs d'Oxygène, Masques & Accessoires, Glucomètres.";

export const metadata: Metadata = {
  // Makes every relative URL below (and in child pages) absolute.
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: "Yuwell, équipement médical, concentrateur oxygène, CPAP, VNI, BiPAP, masque respiratoire, glucomètre, Tunisie, Violette Medical",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "VIOLETTE MEDICAL DISTRIBUTION+",
    url: siteUrl,
    locale: "fr_TN",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VIOLETTE MEDICAL DISTRIBUTION+ — Représentant officiel Yuwell en Tunisie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicons/favicon.ico" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/favicons/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/favicons/android-chrome-512x512.png" },
    ],
  },
  manifest: "/favicons/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Marks the document as JS-capable before first paint so scroll-reveal
            animations apply. Without JS the content renders plainly visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {umamiWebsiteId && (
          <script defer src={umamiSrc} data-website-id={umamiWebsiteId} />
        )}
      </head>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <LanguageProvider>
            <QuoteCartProvider>
              {children}
              {process.env.NODE_ENV === "development" && <DevTools />}
            </QuoteCartProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
