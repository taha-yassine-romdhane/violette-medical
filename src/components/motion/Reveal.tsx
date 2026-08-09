"use client";

import { useEffect, useRef, useState, ReactNode, CSSProperties } from "react";

interface RevealProps {
  children: ReactNode;
  /** Animation direction */
  variant?: "up" | "left" | "right" | "scale";
  /** Delay in ms (for staggering) */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "span" | "li";
}

/** Reveals its children with a soft rise/fade when scrolled into view. */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer support: show immediately rather than leaving the block blank.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);

    // Safety net: content must never stay invisible if the observer misfires
    // (tab restored from bfcache, resize during load, zero-height at mount...).
    const failsafe = window.setTimeout(() => setVisible(true), 2000);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  const variantClass =
    variant === "left" ? "reveal-left" : variant === "right" ? "reveal-right" : variant === "scale" ? "reveal-scale" : "";

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${variantClass} ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
