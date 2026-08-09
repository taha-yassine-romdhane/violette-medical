"use client";

import { useState, useEffect, useRef, memo } from "react";
import { useLanguage } from "@/context/LanguageContext";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&@!";

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** Duration of scramble in ms (default 450) */
  duration?: number;
  /** Delay before starting in ms (default 0) */
  delay?: number;
}

function ScrambleTextInner({ text, className, duration = 450, delay = 0 }: ScrambleTextProps) {
  const { language } = useLanguage();
  const [display, setDisplay] = useState(text);
  const prevLangRef = useRef(language);
  const rafRef = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplay(text);
      prevLangRef.current = language;
      return;
    }

    // If language didn't change, just update text
    if (prevLangRef.current === language) {
      setDisplay(text);
      return;
    }
    prevLangRef.current = language;

    const target = text;
    let startTime: number | null = null;

    function animate(time: number) {
      if (!startTime) startTime = time + delay;
      const elapsed = time - startTime;

      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      // Characters resolve left-to-right
      const resolved = Math.floor(eased * target.length);

      let result = "";
      for (let i = 0; i < target.length; i++) {
        if (i < resolved) {
          result += target[i];
        } else if (target[i] === " ") {
          result += " ";
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      setDisplay(result);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [text, language, duration, delay]);

  return <span className={className}>{display}</span>;
}

const ScrambleText = memo(ScrambleTextInner);
export default ScrambleText;
