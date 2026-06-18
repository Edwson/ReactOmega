"use client";

import { useEffect, useRef, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface MagneticTextProps {
  text: string;
  /** Max px each letter is pulled toward the pointer. @default 18 */
  strength?: number;
  /** Influence radius in px. @default 100 */
  radius?: number;
  /** Spring acceleration factor (0..1). @default 0.16 */
  stiffness?: number;
  /** Spring damping (0..1). @default 0.74 */
  damping?: number;
  className?: string;
  /** Element to render as. @default "span" */
  as?: ElementType;
}

/**
 * MagneticText — every letter is independently magnetic, springing toward the
 * pointer and easing back with real spring physics. Letter positions are
 * tracked relative to the container and the container's live rect is read each
 * frame, so the pull stays accurate while the page scrolls. No motion for
 * reduced-motion users.
 */
export function MagneticText({
  text,
  strength = 18,
  radius = 100,
  stiffness = 0.16,
  damping = 0.74,
  className,
  as: Tag = "span",
}: MagneticTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    if (!container) return;
    const items = spans.current.filter(Boolean) as HTMLSpanElement[];
    if (!items.length) return;
    const state = items.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    // Each letter's rest center stored RELATIVE to the container box, so it
    // survives scrolling — we add the container's live position each frame.
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
    // Re-measure once after the first frame in case the web font swaps in and
    // shifts letter widths.
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
        const cx = cr.left + o.ox;
        const cy = cr.top + o.oy;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);
        const t = Math.max(0, 1 - dist / radius);
        const tx = dist > 0 ? (dx / dist) * strength * t : 0;
        const ty = dist > 0 ? (dy / dist) * strength * t : 0;
        s.vx = (s.vx + (tx - s.x) * stiffness) * damping;
        s.vy = (s.vy + (ty - s.y) * stiffness) * damping;
        s.x += s.vx;
        s.y += s.vy;
        items[i].style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`;
        if (Math.abs(s.x) > 0.05 || Math.abs(s.y) > 0.05 || Math.abs(s.vx) > 0.05 || Math.abs(s.vy) > 0.05) active = true;
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
  }, [text, strength, radius, stiffness, damping, reduced]);

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
                  className="inline-block will-change-transform"
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
