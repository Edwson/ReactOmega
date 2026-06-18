"use client";

import { useEffect, useRef, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ElasticTextProps {
  text: string;
  /** Extra scale at full influence. @default 0.6 */
  maxScale?: number;
  /** How far each letter rises at full influence (px). @default 10 */
  lift?: number;
  /** Influence radius in px. @default 90 */
  radius?: number;
  /** Spring acceleration (higher = snappier). @default 0.22 */
  stiffness?: number;
  /** Spring damping (lower = more jelly overshoot). @default 0.6 */
  damping?: number;
  className?: string;
  /** Element to render as. @default "span" */
  as?: ElementType;
}

/**
 * ElasticText — letters swell and lift with a springy, overshooting "jelly"
 * squash-and-stretch as the pointer passes. Letter positions are tracked
 * relative to the container (and its live rect is read each frame), so the
 * effect stays accurate while the page scrolls. Lower damping = more wobble.
 * Letters sit still for reduced-motion users.
 */
export function ElasticText({
  text,
  maxScale = 0.6,
  lift = 10,
  radius = 90,
  stiffness = 0.22,
  damping = 0.6,
  className,
  as: Tag = "span",
}: ElasticTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    if (!container) return;
    const items = spans.current.filter(Boolean) as HTMLSpanElement[];
    if (!items.length) return;
    const state = items.map(() => ({ val: 0, v: 0 }));
    let offs: { ox: number; oy: number }[] = [];
    const measure = () => {
      const cr = container.getBoundingClientRect();
      offs = items.map((s) => {
        const prev = s.style.transform;
        s.style.transform = "none";
        const r = s.getBoundingClientRect();
        s.style.transform = prev;
        return { ox: r.left + r.width / 2 - cr.left, oy: r.top + r.height / 2 - cr.top };
      });
    };
    measure();
    const remeasure = requestAnimationFrame(measure);

    let mx = -9999;
    let my = -9999;
    let raf = 0;
    let running = false;
    const step = () => {
      const cr = container.getBoundingClientRect();
      let active = false;
      for (let i = 0; i < items.length; i++) {
        const o = offs[i];
        const s = state[i];
        const dist = Math.hypot(mx - (cr.left + o.ox), my - (cr.top + o.oy));
        const target = Math.max(0, 1 - dist / radius);
        s.v = (s.v + (target - s.val) * stiffness) * damping;
        s.val += s.v;
        const sc = 1 + s.val * maxScale;
        items[i].style.transform = `translateY(${(-s.val * lift).toFixed(2)}px) scale(${sc.toFixed(3)}, ${(1 + s.val * maxScale * 0.55).toFixed(3)})`;
        if (Math.abs(s.val) > 0.002 || Math.abs(s.v) > 0.002) active = true;
      }
      if (active) raf = requestAnimationFrame(step);
      else running = false;
    };
    const ensure = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(step);
      }
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      ensure();
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
      ensure();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", measure);
    container.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(remeasure);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", measure);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [text, maxScale, lift, radius, stiffness, damping, reduced]);

  let idx = 0;
  return (
    <Tag ref={containerRef as React.Ref<HTMLElement>} className={cn("inline-block", className)} aria-label={text}>
      {text.split(/(\s+)/).map((word, wi) =>
        /^\s+$/.test(word) ? (
          <span key={`s${wi}`}>{word}</span>
        ) : (
          <span key={`w${wi}`} className="inline-block whitespace-nowrap" aria-hidden>
            {Array.from(word).map((ch) => {
              const i = idx++;
              return (
                <span
                  key={i}
                  ref={(el) => {
                    spans.current[i] = el;
                  }}
                  className="inline-block origin-bottom will-change-transform"
                >
                  {ch}
                </span>
              );
            })}
          </span>
        ),
      )}
    </Tag>
  );
}
