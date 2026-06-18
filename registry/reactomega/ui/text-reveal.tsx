"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface TextRevealProps {
  text: string;
  className?: string;
  /** Color of words not yet revealed. @default "rgba(255,255,255,.16)" */
  dimColor?: string;
  /** Color of revealed words. @default "#ffffff" */
  litColor?: string;
  /** Softness of the reveal edge, in words. @default 4 */
  softness?: number;
}

/**
 * TextReveal — words brighten one after another as the block scrolls through the
 * viewport (scroll-linked, not a one-shot). A reading spotlight that follows the
 * scroll. Fully lit immediately for reduced-motion users.
 */
export function TextReveal({
  text,
  className,
  dimColor = "rgba(255,255,255,.16)",
  litColor = "#ffffff",
  softness = 4,
}: TextRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");

  useEffect(() => {
    if (reduced) {
      wordRefs.current.forEach((w) => w && (w.style.color = litColor));
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = Math.max(0, Math.min(1, (vh * 0.82 - r.top) / (r.height + vh * 0.5)));
      const head = progress * (words.length + softness);
      wordRefs.current.forEach((w, i) => {
        if (!w) return;
        const t = Math.max(0, Math.min(1, (head - i) / softness));
        w.style.color = t >= 1 ? litColor : t <= 0 ? dimColor : litColor;
        w.style.opacity = String(0.18 + t * 0.82);
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [text, dimColor, litColor, softness, reduced]);

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden
          ref={(el) => {
            wordRefs.current[i] = el;
          }}
          className="mr-[0.25em] transition-colors"
          style={{ color: dimColor, opacity: 0.18 }}
        >
          {w}
        </span>
      ))}
    </p>
  );
}
