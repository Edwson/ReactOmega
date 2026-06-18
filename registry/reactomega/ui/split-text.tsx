"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface SplitTextProps {
  text: string;
  className?: string;
  /** Split granularity. @default "chars" */
  by?: "chars" | "words";
  /** Seconds between each unit's entrance. @default 0.04 */
  stagger?: number;
  /** Per-unit transition duration in seconds. @default 0.5 */
  duration?: number;
  /** Animate only the first time it enters the viewport. @default true */
  once?: boolean;
  /** Pixels each unit rises while fading in. @default 16 */
  distance?: number;
  /** Reveal only when scrolled into view; set false to play on mount. @default true */
  startOnView?: boolean;
  /** Element to render as. @default "p" */
  as?: ElementType;
}

/**
 * SplitText — reveals text one character or word at a time when it scrolls
 * into view, with a staggered spring-like rise. Screen readers get the whole
 * string via aria-label; reduced-motion users see it instantly.
 */
export function SplitText({
  text,
  className,
  by = "chars",
  stagger = 0.04,
  duration = 0.5,
  once = true,
  distance = 16,
  startOnView = true,
  as: Tag = "p",
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Play on mount (e.g. galleries) — reveal one frame later so the staggered
    // CSS transition runs; a timer backs up the rAF against StrictMode timing.
    if (!startOnView) {
      const raf = requestAnimationFrame(() => setShown(true));
      const tid = setTimeout(() => setShown(true), 60);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(tid);
      };
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const onScreen = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      return r.bottom > 0 && r.top < vh;
    };
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }),
      { threshold: 0.2 },
    );
    io.observe(el);
    // Fallback: after first layout, reveal if already on screen. Covers
    // lazy-mount wrappers and StrictMode, where the observer's first async
    // callback can be dropped, leaving the text stuck hidden.
    const raf = requestAnimationFrame(() => {
      if (onScreen()) {
        setShown(true);
        if (once) io.disconnect();
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [once, startOnView]);

  const units = by === "words" ? text.split(/(\s+)/) : Array.from(text);
  const visible = shown || reduced;

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={cn("inline-block", className)} aria-label={text}>
      {units.map((u, i) => {
        if (/^\s+$/.test(u)) return <span key={i}>{u}</span>;
        return (
          <span
            key={i}
            aria-hidden
            className="inline-block will-change-transform"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
              transition: reduced
                ? "none"
                : `opacity ${duration}s ease, transform ${duration}s cubic-bezier(.2,.65,.3,1)`,
              transitionDelay: reduced ? "0s" : `${i * stagger}s`,
            }}
          >
            {u === " " ? " " : u}
          </span>
        );
      })}
    </Tag>
  );
}
