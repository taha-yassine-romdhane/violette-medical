"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useSession, signOut } from "next-auth/react";

function getDashboardPath(role: string) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "COMMERCIAL":
      return "/commercial";
    default:
      return "/account";
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "Administrateur";
    case "COMMERCIAL":
      return "Commercial";
    default:
      return "Client";
  }
}

/** Small inline flags — Windows has no flag emoji, so these are drawn. */
function FlagFR({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 15" className={className} aria-hidden="true">
      <rect width="7" height="15" fill="#002654" />
      <rect x="7" width="7" height="15" fill="#ffffff" />
      <rect x="14" width="7" height="15" fill="#CE1126" />
    </svg>
  );
}

function FlagEN({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

interface CartPreviewItem {
  id: string;
  quantity: number;
  product?: { nameFr: string; slug: string; thumbnail: string | null; priceTTC: number };
  pack?: { nameFr: string; slug: string; image: string | null; priceTTC: number };
}

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartPreviewItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  // Elevate the header once scrolled + track reading progress
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Fetch cart count on mount
  useEffect(() => {
    if (session?.user) {
      fetch("/api/cart")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setCartCount(data.itemCount || 0);
        })
        .catch(() => {});
    }
  }, [session]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setIsCartOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Freeze the page behind the drawer + close on Escape.
  // The lock must be applied to <html> as well: globals.css sets
  // `overflow-x: hidden` on it, which makes <html> the scrolling element, so
  // locking only <body> would leave the page scrollable underneath.
  useEffect(() => {
    if (!isMenuOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevPad = body.style.paddingRight;

    // Compensate the scrollbar width so the page doesn't jump when it vanishes.
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      body.style.paddingRight = prevPad;
      window.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  // Icon per nav entry, used by the mobile drawer
  const navIconPaths: Record<string, string> = {
    "/": "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75",
    "/products": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    "/about": "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
    "/catalogue": "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    "/events": "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    "/contact": "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  };

  const fetchCartPreview = useCallback(async () => {
    setCartLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.cart?.items || []);
        setCartTotal(data.cart?.totalTTC || 0);
        setCartCount(data.itemCount || 0);
      }
    } catch { /* ignore */ }
    setCartLoading(false);
  }, []);

  function handleCartToggle() {
    const willOpen = !isCartOpen;
    setIsCartOpen(willOpen);
    setIsUserMenuOpen(false);
    if (willOpen) fetchCartPreview();
  }

  function handleUserMenuToggle() {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsCartOpen(false);
  }

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/about", label: t.nav.about },
    { href: "/catalogue", label: t.nav.catalogue },
    { href: "/events", label: t.nav.events },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b transition-[box-shadow,border-color] duration-300 ${
          scrolled ? "border-gray-200/70 shadow-[0_1px_16px_rgba(17,24,39,0.07)]" : "border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="group flex items-center shrink-0" aria-label="Violette Medical Distribution">
              <Image
                src="/logo.PNG"
                alt="Violette Medical Distribution"
                width={180}
                height={50}
                className="h-9 sm:h-11 w-auto transition-transform duration-200 group-hover:scale-[1.03]"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-[14px] font-medium rounded-lg transition-all duration-150 ${
                    isActive(link.href)
                      ? "text-purple-700"
                      : "text-gray-600 hover:text-purple-700 hover:bg-purple-50/60"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute left-3.5 right-3.5 -bottom-[3px] h-0.5 bg-purple-600 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Language — one clean tile showing the active flag; tap to switch */}
              <button
                onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
                aria-label={language === "fr" ? "Passer en anglais" : "Switch to French"}
                title={language === "fr" ? "English" : "Français"}
                className="group flex items-center gap-1.5 h-10 pl-2 pr-2.5 rounded-xl border border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/40 active:scale-95 transition-all"
              >
                <span className="w-[22px] h-[15px] rounded-[3px] overflow-hidden ring-1 ring-gray-900/10 flex shrink-0">
                  {language === "fr" ? <FlagFR className="w-full h-full" /> : <FlagEN className="w-full h-full" />}
                </span>
                <span className="text-[11px] font-bold tracking-wide text-gray-600 group-hover:text-purple-700 transition-colors">
                  {language.toUpperCase()}
                </span>
                <svg
                  className="w-3 h-3 text-gray-300 group-hover:text-purple-400 transition-colors"
                  fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>

              {/* Cart icon + dropdown */}
              {session?.user && (
                <div className="relative" ref={cartRef}>
                  <button
                    onClick={handleCartToggle}
                    className="relative w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:border-purple-300 hover:text-purple-700 active:scale-95 transition-all"
                    aria-label="Panier"
                  >
                    <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </button>

                  {/* Cart dropdown */}
                  {isCartOpen && (
                    <div className="absolute right-0 top-full mt-3 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      {/* Arrow */}
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

                      <div className="relative">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Mon panier</p>
                            {cartCount > 0 && (
                              <p className="text-xs text-gray-500 mt-0.5">{cartCount} article{cartCount !== 1 ? "s" : ""}</p>
                            )}
                          </div>
                          <Link
                            href="/account/cart"
                            onClick={() => setIsCartOpen(false)}
                            className="text-xs text-purple-700 hover:text-purple-900 font-medium"
                          >
                            Tout voir
                          </Link>
                        </div>

                        {/* Items */}
                        <div className="max-h-[280px] overflow-y-auto">
                          {cartLoading ? (
                            <div className="flex items-center justify-center py-10">
                              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : cartItems.length === 0 ? (
                            <div className="py-10 text-center">
                              <svg className="w-10 h-10 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                              </svg>
                              <p className="text-sm text-gray-400">Votre panier est vide</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-50">
                              {cartItems.slice(0, 4).map((item) => {
                                const entry = item.product || item.pack;
                                if (!entry) return null;
                                const imgSrc = item.product?.thumbnail || item.pack?.image;
                                return (
                                  <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                                    <div className="w-11 h-11 rounded-lg bg-white border border-gray-100 shrink-0 overflow-hidden">
                                      {imgSrc ? (
                                        <Image src={imgSrc} alt={entry.nameFr} width={44} height={44} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[13px] font-medium text-gray-800 truncate">{entry.nameFr}</p>
                                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                                    </div>
                                    <p className="text-[13px] font-semibold text-gray-900 shrink-0 tabular-nums">
                                      {(entry.priceTTC * item.quantity).toFixed(2)} <span className="text-[10px] font-normal text-gray-500">DT</span>
                                    </p>
                                  </div>
                                );
                              })}
                              {cartItems.length > 4 && (
                                <div className="px-5 py-2 text-center">
                                  <p className="text-xs text-gray-400">+{cartItems.length - 4} autre{cartItems.length - 4 > 1 ? "s" : ""} article{cartItems.length - 4 > 1 ? "s" : ""}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/40">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-gray-500">Total TTC</span>
                              <span className="text-lg font-bold text-purple-700 tabular-nums">{cartTotal.toFixed(2)} DT</span>
                            </div>
                            <Link
                              href="/account/cart"
                              onClick={() => setIsCartOpen(false)}
                              className="block w-full text-center py-2.5 bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold rounded-xl transition-colors"
                            >
                              Voir le panier
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Auth area (desktop) */}
              <div className="hidden md:block">
                {status === "loading" ? (
                  <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
                ) : session?.user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={handleUserMenuToggle}
                      className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-sm font-bold uppercase shadow-sm">
                        {session.user.name?.charAt(0) || "U"}
                      </div>
                      <svg
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                        <div className="absolute -top-2 right-5 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />
                        <div className="relative">
                          <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/40">
                            <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{session.user.email}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-purple-100 text-purple-700 rounded-full">
                              {getRoleLabel(session.user.role)}
                            </span>
                          </div>

                          <div className="py-1.5">
                            <Link
                              href={getDashboardPath(session.user.role)}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50/60 hover:text-purple-700 transition-colors"
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm10.5 0A2.25 2.25 0 0116.5 3.75h2.25A2.25 2.25 0 0121 6v2.25a2.25 2.25 0 01-2.25 2.25H16.5a2.25 2.25 0 01-2.25-2.25V6zM3.75 16.5A2.25 2.25 0 016 14.25h2.25A2.25 2.25 0 0110.5 16.5v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V16.5zm10.5 0a2.25 2.25 0 012.25-2.25h2.25A2.25 2.25 0 0121 16.5v2.25A2.25 2.25 0 0118.75 21H16.5a2.25 2.25 0 01-2.25-2.25V16.5z" />
                              </svg>
                              Tableau de bord
                            </Link>
                            {session.user.role === "USER" && (
                              <Link
                                href="/account/orders"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50/60 hover:text-purple-700 transition-colors"
                              >
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                                </svg>
                                Mes commandes
                              </Link>
                            )}
                          </div>

                          <div className="border-t border-gray-100 py-1.5">
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                signOut({ callbackUrl: "/" });
                              }}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                              </svg>
                              {language === "fr" ? "Déconnexion" : "Sign out"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/signin"
                    className="flex items-center gap-2 bg-gradient-to-b from-purple-600 to-purple-700 text-white pl-3.5 pr-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-purple-900/25 hover:from-purple-700 hover:to-purple-800 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    {language === "fr" ? "Espace client" : "Client area"}
                  </Link>
                )}
              </div>

              {/* Account tile (mobile / tablet) */}
              <div className="md:hidden">
                {status === "loading" ? (
                  <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                ) : session?.user ? (
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    aria-label={language === "fr" ? "Mon compte" : "My account"}
                    className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white text-sm font-bold uppercase flex items-center justify-center shadow-sm shadow-purple-900/25 active:scale-95 transition-transform"
                  >
                    {session.user.name?.charAt(0) || "U"}
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </button>
                ) : (
                  <Link
                    href="/signin"
                    aria-label={language === "fr" ? "Espace client" : "Client area"}
                    title={language === "fr" ? "Espace client" : "Client area"}
                    className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center hover:bg-purple-100 hover:border-purple-300 active:scale-95 transition-all"
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Menu tile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="group lg:hidden w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50/40 active:scale-95 transition-all"
                aria-label="Menu"
                aria-expanded={isMenuOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h11M4 17h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Reading progress */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </header>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-950/50 backdrop-blur-sm animate-[fade-in_0.25s_ease-out]"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[21rem] bg-white shadow-2xl flex flex-col rounded-l-3xl overflow-hidden animate-[menu-slide-in_0.32s_cubic-bezier(0.22,1,0.36,1)]">
            {/* Violet wash behind the header area */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-purple-50 to-transparent pointer-events-none" />

            {/* Drawer header */}
            <div className="relative flex items-center justify-between px-5 h-[72px] shrink-0">
              <Image
                src="/logo.PNG"
                alt="Violette Medical Distribution"
                width={150}
                height={42}
                className="h-9 w-auto"
              />
              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label={language === "fr" ? "Fermer le menu" : "Close menu"}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-purple-700 hover:border-purple-200 active:scale-95 transition-all"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="relative flex-1 overflow-y-auto px-4 pb-6">
              {/* Nav links */}
              <nav className="space-y-1">
                {navLinks.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      style={{ animationDelay: `${60 + i * 45}ms` }}
                      className={`group relative flex items-center gap-3.5 py-2.5 px-3 rounded-2xl transition-colors animate-[menu-item-in_0.4s_ease-out_backwards] ${
                        active ? "bg-purple-50" : "hover:bg-gray-50 active:bg-gray-100"
                      }`}
                    >
                      {/* Active accent bar */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-purple-600" />
                      )}
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          active
                            ? "bg-gradient-to-b from-purple-600 to-purple-700 text-white shadow-sm shadow-purple-900/20"
                            : "bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600"
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={navIconPaths[link.href]} />
                        </svg>
                      </span>
                      <span className={`flex-1 text-[15px] font-semibold ${active ? "text-purple-800" : "text-gray-700"}`}>
                        {link.label}
                      </span>
                      <svg
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${active ? "text-purple-500" : "text-gray-300"}`}
                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </nav>

              {/* Quick contact actions */}
              <div className="mt-5 animate-[menu-item-in_0.4s_ease-out_backwards]" style={{ animationDelay: "350ms" }}>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-2.5 px-1">
                  {language === "fr" ? "Contact rapide" : "Quick contact"}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      href: "tel:+21655820000",
                      label: language === "fr" ? "Appeler" : "Call",
                      d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                      ext: false,
                    },
                    {
                      href: "mailto:Direction@violettemedical.com",
                      label: "Email",
                      d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                      ext: false,
                    },
                    {
                      href: "https://www.google.com/maps/search/?api=1&query=35.734867,10.5740649",
                      label: language === "fr" ? "Itinéraire" : "Directions",
                      d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
                      ext: true,
                    },
                  ].map((a) => (
                    <a
                      key={a.label}
                      href={a.href}
                      {...(a.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-gray-100 bg-gray-50/70 text-gray-600 hover:border-purple-200 hover:text-purple-700 hover:bg-purple-50/60 active:scale-[0.97] transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={a.d} />
                      </svg>
                      <span className="text-[11px] font-semibold">{a.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Language switcher */}
              <div className="mt-5 animate-[menu-item-in_0.4s_ease-out_backwards]" style={{ animationDelay: "400ms" }}>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-2.5 px-1">
                  {language === "fr" ? "Langue" : "Language"}
                </p>
                <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-2xl p-1">
                  {(["fr", "en"] as const).map((lng) => (
                    <button
                      key={lng}
                      onClick={() => setLanguage(lng)}
                      className={`py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                        language === lng
                          ? "bg-white text-purple-700 shadow-sm"
                          : "text-gray-500 hover:text-purple-700"
                      }`}
                    >
                      {lng === "fr" ? "Français" : "English"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Yuwell partner badge */}
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50/50 px-4 py-2.5 animate-[menu-item-in_0.4s_ease-out_backwards]" style={{ animationDelay: "450ms" }}>
                <span className="bg-white rounded-lg px-2 py-1 shrink-0">
                  <Image src="/Yuwell.webp" alt="Yuwell" width={56} height={18} className="h-3.5 w-auto object-contain" />
                </span>
                <p className="text-[11px] leading-snug text-purple-900/70 font-medium">
                  {language === "fr" ? "Représentant officiel en Tunisie" : "Official representative in Tunisia"}
                </p>
              </div>
            </div>

            {/* Sticky footer: account / sign in */}
            {status !== "loading" && (
              <div className="relative border-t border-gray-100 bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
                {session?.user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-sm font-bold uppercase shadow-sm shrink-0">
                        {session.user.name?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 shrink-0">
                        {getRoleLabel(session.user.role)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={getDashboardPath(session.user.role)}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex-1 text-center py-2.5 text-sm font-semibold text-purple-700 bg-purple-50 rounded-xl hover:bg-purple-100 active:scale-[0.98] transition-all"
                      >
                        {language === "fr" ? "Mon compte" : "My account"}
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        aria-label={language === "fr" ? "Déconnexion" : "Sign out"}
                        className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 active:scale-[0.98] transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-primary w-full py-3 text-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      {language === "fr" ? "Espace client" : "Client area"}
                    </Link>
                    <p className="text-[11px] text-gray-400 text-center mt-2.5">
                      {language === "fr"
                        ? "Professionnel de santé ? Demandez votre accès."
                        : "Healthcare professional? Request access."}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
