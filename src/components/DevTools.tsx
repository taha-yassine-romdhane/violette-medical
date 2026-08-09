"use client";

// DEV ONLY — floating bubble giving quick access to every page and
// one-click login for each role. Rendered only when NODE_ENV=development
// (see layout.tsx), so it never ships to production.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

const PAGES: { label: string; href: string; group: string }[] = [
  { label: "Accueil", href: "/", group: "Public" },
  { label: "Produits", href: "/products", group: "Public" },
  { label: "Catalogues", href: "/catalogue", group: "Public" },
  { label: "Événements", href: "/events", group: "Public" },
  { label: "À propos", href: "/about", group: "Public" },
  { label: "Contact", href: "/contact", group: "Public" },
  { label: "Connexion", href: "/signin", group: "Public" },
  { label: "403", href: "/403", group: "Public" },
  { label: "Compte", href: "/account", group: "Client" },
  { label: "Panier", href: "/account/cart", group: "Client" },
  { label: "Commandes", href: "/account/orders", group: "Client" },
  { label: "Commercial", href: "/commercial", group: "Espaces" },
  { label: "Admin", href: "/admin", group: "Espaces" },
];

const ROLES = [
  { role: "ADMIN", label: "Admin", target: "/admin", color: "bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/25" },
  { role: "COMMERCIAL", label: "Commercial", target: "/commercial", color: "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25" },
  { role: "USER", label: "Client", target: "/account", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25" },
] as const;

export default function DevTools() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  async function loginAs(role: string, target: string) {
    setBusy(role);
    try {
      const res = await fetch("/api/dev/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) return;
      const { email, password } = await res.json();
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.ok) window.location.href = target;
    } finally {
      setBusy(null);
    }
  }

  const groups = Array.from(new Set(PAGES.map((p) => p.group)));

  return (
    <div className="fixed bottom-4 right-4 z-[200]">
      {/* Drawer */}
      {open && (
        <div className="absolute bottom-16 right-0 w-[300px] bg-gray-900 border border-white/15 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Dev Tools</span>
            </div>
            {status === "authenticated" ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase">
                {session?.user?.role}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-400 uppercase">
                Invité
              </span>
            )}
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
            {/* Role switcher */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Se connecter en tant que
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {ROLES.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => loginAs(r.role, r.target)}
                    disabled={busy !== null}
                    className={`px-2 py-2 text-[11px] font-semibold rounded-lg border transition-colors disabled:opacity-50 ${r.color} ${
                      session?.user?.role === r.role ? "ring-1 ring-white/40" : ""
                    }`}
                  >
                    {busy === r.role ? "..." : r.label}
                  </button>
                ))}
              </div>
              {status === "authenticated" && (
                <button
                  onClick={() => signOut({ callbackUrl: pathname })}
                  className="mt-1.5 w-full px-2 py-1.5 text-[11px] font-semibold rounded-lg border border-white/15 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Se déconnecter ({session?.user?.email})
                </button>
              )}
            </div>

            {/* Page links */}
            {groups.map((group) => (
              <div key={group}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{group}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PAGES.filter((p) => p.group === group).map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      onClick={() => setOpen(false)}
                      className={`px-2.5 py-1.5 text-[12px] font-medium rounded-lg border transition-colors truncate ${
                        pathname === p.href
                          ? "bg-purple-500/20 text-purple-300 border-purple-400/40"
                          : "border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-gradient-to-b from-purple-600 to-purple-800 text-white shadow-xl shadow-purple-900/40 border border-purple-400/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        title="Dev Tools"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
          </svg>
        )}
      </button>
    </div>
  );
}
