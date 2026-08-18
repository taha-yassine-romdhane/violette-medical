"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface QuoteItem {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  reference: string | null;
  thumbnail: string | null;
  qty: number;
}

interface QuoteCartContextValue {
  items: QuoteItem[];
  count: number;
  add: (item: Omit<QuoteItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "devis-cart";

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

/**
 * Guest quote basket ("panier devis"). Persisted in localStorage so visitors
 * can build a quote request across pages without an account. No prices —
 * the storefront is quote-based.
 */
export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter((i) => i && i.id && i.qty > 0));
      }
    } catch {
      /* corrupted storage — start fresh */
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration, so we don't overwrite with [])
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full/blocked — cart still works in memory */
    }
  }, [items, hydrated]);

  const add = useCallback((item: Omit<QuoteItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <QuoteCartContext.Provider value={{ items, count, add, setQty, remove, clear }}>
      {children}
    </QuoteCartContext.Provider>
  );
}

export function useQuoteCart() {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error("useQuoteCart must be used within QuoteCartProvider");
  return ctx;
}
