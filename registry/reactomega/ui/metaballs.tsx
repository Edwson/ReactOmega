"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface MetaballsProps {
  className?: string;
  /** Number of blobs. @default 7 */
  count?: number;
  /** Fluid color. @default "#7c5cff" */
  color?: string;
  /** Base blob diameter in px. @default 90 */
  size?: number;
  /** Flow lag, 0..1 — lower feels thicker. @default 0.08 */
  viscosity?: number;
  /** A blob that sticks to the pointer. @default true */
  pointerBlob?: boolean;
}

/**
 * Metaballs — a gooey fluid that flows toward the pointer and merges with real
 * surface-tension feel (an SVG goo filter). Blobs orbit a center that eases after
 * the cursor with a configurable viscosity. Settles into a still cluster for
 * reduced-motion users.
 */
export function Metaballs({
  className,
  count = 7,
  color = "#7c5cff",
  size = 90,
  viscosity = 0.08,
  pointerBlob = true,
}: MetaballsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const filterId = "ro-goo-" + useId().replace(/[^a-zA-Z0-9-]/g, "");

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let w = 0, h = 0;
    const field = { x: 0, y: 0, tx: 0, ty: 0 };
    const blobs = blobRefs.current.filter(Boolean) as HTMLDivElement[];
    const seeds = blobs.map((_, i) => ({
      angle: (i / blobs.length) * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.012,
      orbit: 0.12 + Math.random() * 0.22,
      x: 0, y: 0,
      r: (0.6 + Math.random() * 0.7) * (size / 2),
    }));
    let raf = 0;
    let hasPointer = false;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      w = r.width; h = r.height;
      field.x = field.tx = w / 2;
      field.y = field.ty = h / 2;
    };
    resize();

    const place = () => {
      const minDim = Math.min(w, h);
      blobs.forEach((el, i) => {
        const s = seeds[i];
        const tx = field.x + Math.cos(s.angle) * s.orbit * minDim;
        const ty = field.y + Math.sin(s.angle) * s.orbit * minDim;
        s.x += (tx - s.x) * (reduced ? 1 : Math.max(0.02, viscosity));
        s.y += (ty - s.y) * (reduced ? 1 : Math.max(0.02, viscosity));
        el.style.width = el.style.height = `${s.r * 2}px`;
        el.style.transform = `translate(${(s.x - s.r).toFixed(1)}px, ${(s.y - s.r).toFixed(1)}px)`;
      });
      // pointer blob = blob 0 sticks closer to the cursor
      if (pointerBlob && blobs[0] && hasPointer) {
        const s = seeds[0];
        s.x += (field.tx - s.x) * (reduced ? 1 : 0.25);
        s.y += (field.ty - s.y) * (reduced ? 1 : 0.25);
        blobs[0].style.transform = `translate(${(s.x - s.r).toFixed(1)}px, ${(s.y - s.r).toFixed(1)}px)`;
      }
    };

    const step = () => {
      field.x += (field.tx - field.x) * viscosity;
      field.y += (field.ty - field.y) * viscosity;
      seeds.forEach((s) => (s.angle += s.speed));
      place();
      raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      field.tx = e.clientX - r.left;
      field.ty = e.clientY - r.top;
      hasPointer = true;
    };
    const onLeave = () => { field.tx = w / 2; field.ty = h / 2; hasPointer = false; };

    if (reduced) {
      place();
    } else {
      raf = requestAnimationFrame(step);
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [count, size, viscosity, pointerBlob, reduced]);

  return (
    <div ref={wrapRef} className={cn("relative h-full w-full overflow-hidden", className)}>
      <svg className="absolute h-0 w-0" aria-hidden>
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
          </filter>
        </defs>
      </svg>
      <div className="absolute inset-0" style={{ filter: `url(#${filterId})` }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              blobRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 rounded-full will-change-transform"
            style={{ background: color }}
          />
        ))}
      </div>
    </div>
  );
}
