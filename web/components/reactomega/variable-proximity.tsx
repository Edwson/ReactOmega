"use client";

import { useEffect, useRef, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface VariableProximityProps {
  text: string;
  /** Resting variable-font settings, e.g. "'wght' 400, 'opsz' 9". */
  fromFontVariationSettings?: string;
  /** Settings when the pointer is on a letter, e.g. "'wght' 900, 'opsz' 40". */
  toFontVariationSettings?: string;
  /** Influence radius in px. @default 120 */
  radius?: number;
  /** Distance falloff curve. @default "gaussian" */
  falloff?: "linear" | "gaussian" | "exponential";
  className?: string;
  /** Element to render as. @default "span" */
  as?: ElementType;
}

const AXIS = /'(\w+)'\s+([\d.-]+)/g;
function parse(s: string) {
  const map: Record<string, number> = {};
  let m: RegExpExecArray | null;
  while ((m = AXIS.exec(s))) map[m[1]] = parseFloat(m[2]);
  return map;
}

/**
 * VariableProximity — every letter's variable-font axes (weight, width, optical
 * size, slant, or any custom axis) interpolate based on how close the pointer is.
 * Fully configurable: pass any axes in `from`/`to`, a radius, and a falloff curve.
 * Requires a variable font on the element. Static (resting) for reduced-motion.
 */
export function VariableProximity({
  text,
  fromFontVariationSettings = "'wght' 400, 'opsz' 9",
  toFontVariationSettings = "'wght' 900, 'opsz' 40",
  radius = 120,
  falloff = "gaussian",
  className,
  as: Tag = "span",
}: VariableProximityProps) {
  const containerRef = useRef<HTMLElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reduced) return;

    const from = parse(fromFontVariationSettings);
    const to = parse(toFontVariationSettings);
    const axes = Array.from(new Set([...Object.keys(from), ...Object.keys(to)]));
    const curve = (d: number) => {
      const x = Math.min(1, Math.max(0, d / radius));
      if (falloff === "linear") return 1 - x;
      if (falloff === "exponential") return (1 - x) * (1 - x);
      return Math.exp(-(x * x) * 4); // gaussian
    };

    let raf = 0;
    let mx = -9999;
    let my = -9999;
    const apply = () => {
      raf = 0;
      const spans = letterRefs.current;
      for (const span of spans) {
        if (!span) continue;
        const r = span.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const t = curve(Math.hypot(mx - cx, my - cy));
        span.style.fontVariationSettings = axes
          .map((a) => `'${a}' ${(from[a] ?? to[a]) + (((to[a] ?? from[a]) - (from[a] ?? to[a])) * t)}`)
          .join(", ");
      }
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [fromFontVariationSettings, toFontVariationSettings, radius, falloff, reduced]);

  let idx = 0;
  const words = text.split(/(\s+)/);
  return (
    <Tag ref={containerRef as React.Ref<HTMLElement>} className={cn("inline-block", className)} aria-label={text}>
      {words.map((word, wi) => {
        if (/^\s+$/.test(word)) return <span key={`s${wi}`}>{word}</span>;
        return (
          <span key={`w${wi}`} className="inline-block whitespace-nowrap" aria-hidden>
            {Array.from(word).map((ch) => {
              const i = idx++;
              return (
                <span
                  key={i}
                  ref={(el) => {
                    letterRefs.current[i] = el;
                  }}
                  className="inline-block"
                  style={{ fontVariationSettings: fromFontVariationSettings }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
