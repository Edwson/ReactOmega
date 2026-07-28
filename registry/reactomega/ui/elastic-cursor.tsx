"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ElasticCursorProps {
  className?: string;
  /** Diameter of the lead blob in px. @default 34 */
  size?: number;
  /** Blob color. @default "#7c5cff" */
  color?: string;
  /** How far the blob stretches at full speed, as a fraction of its size. @default 0.55 */
  stretch?: number;
  /** Spring acceleration, 0..1 — higher chases the pointer harder. @default 0.3 */
  stiffness?: number;
  /** Spring damping, 0..1 — lower settles with less wobble. @default 0.5 */
  damping?: number;
  /** Number of smaller blobs chained behind the lead one. @default 2 */
  trail?: number;
  /** Merge the blobs through an SVG goo filter. @default true */
  goo?: boolean;
}

/**
 * ElasticCursor — a gooey blob that deforms along its own velocity vector. Each
 * frame the blob's spring velocity gives both a direction and a speed: the blob
 * rotates to `atan2(vy, vx)` and scales by `1 + k` along that axis while scaling
 * by `1 / (1 + k)` across it, so the product stays 1 and the blob conserves its
 * area — it stretches into a teardrop under a flick and relaxes back to a perfect
 * circle at rest, never inflating.
 *
 * Speed maps to stretch through `1 - exp(-v / 14)`, a saturating curve, so there
 * is no clamp discontinuity when the pointer is thrown across the screen. Trailing
 * blobs are a follower chain — each one springs toward the one ahead with reduced
 * stiffness — and an SVG goo filter (blur plus an alpha contrast ramp) welds them
 * into a single surface that necks and snaps. The filter id comes from `useId()`
 * so several instances never collide.
 *
 * The loop idles once every blob has caught up. Coarse pointers render nothing;
 * reduced motion pins every blob to the pointer with no stretch and no rotation.
 */
export function ElasticCursor({
  className,
  size = 34,
  color = "#7c5cff",
  stretch = 0.55,
  stiffness = 0.3,
  damping = 0.5,
  trail = 2,
  goo = true,
}: ElasticCursorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fine, setFine] = useState(false);
  const reduced = usePrefersReducedMotion();
  const filterId = "ro-elastic-" + useId().replace(/[^a-zA-Z0-9-]/g, "");

  const count = Math.max(1, Math.round(trail) + 1);
  const diameter = (i: number) => Math.round(size * Math.max(0.35, 1 - 0.22 * i));

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!fine) return;
    const root = rootRef.current;
    if (!root) return;
    const blobs = blobRefs.current.slice(0, count).filter(Boolean) as HTMLDivElement[];
    if (!blobs.length) return;

    const state = blobs.map(() => ({ x: -9999, y: -9999, vx: 0, vy: 0, a: 0 }));
    let px = -9999;
    let py = -9999;
    let seen = false;
    let raf = 0;
    let running = false;

    const step = () => {
      const r = root.getBoundingClientRect();
      let active = false;

      for (let i = 0; i < blobs.length; i++) {
        const s = state[i];
        // Blob 0 chases the pointer; every other blob chases the one in front.
        const tx = i === 0 ? px : state[i - 1].x;
        const ty = i === 0 ? py : state[i - 1].y;

        if (reduced) {
          s.x = tx;
          s.y = ty;
          s.vx = 0;
          s.vy = 0;
        } else {
          const k = stiffness * Math.pow(0.72, i);
          s.vx = (s.vx + (tx - s.x) * k) * damping;
          s.vy = (s.vy + (ty - s.y) * k) * damping;
          s.x += s.vx;
          s.y += s.vy;
        }

        const speed = Math.hypot(s.vx, s.vy);
        // Saturating response: fast flicks approach full stretch without a clamp.
        const t = reduced ? 0 : 1 - Math.exp(-speed / 14);
        const sx = 1 + stretch * t;
        const sy = 1 / sx; // area preserved: sx * sy === 1
        if (speed > 0.6) s.a = (Math.atan2(s.vy, s.vx) * 180) / Math.PI;

        blobs[i].style.transform =
          `translate3d(${(s.x - r.left).toFixed(2)}px, ${(s.y - r.top).toFixed(2)}px, 0)` +
          ` translate(-50%, -50%) rotate(${s.a.toFixed(2)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;

        if (Math.abs(tx - s.x) > 0.05 || Math.abs(ty - s.y) > 0.05 || speed > 0.05) active = true;
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
      px = e.clientX;
      py = e.clientY;
      if (!seen) {
        seen = true;
        for (const s of state) {
          s.x = px;
          s.y = py;
        }
        root.style.opacity = "1";
      }
      ensure();
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      root.style.opacity = "0";
      seen = false;
    };
    const onBlur = () => {
      root.style.opacity = "0";
      seen = false;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("blur", onBlur);
    ensure();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("blur", onBlur);
    };
  }, [fine, reduced, count, size, stretch, stiffness, damping]);

  if (!fine) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-[9999]", className)}
      style={{
        opacity: 0,
        transition: reduced ? undefined : "opacity 180ms linear",
        filter: goo && !reduced ? `url(#${filterId})` : undefined,
      }}
    >
      {goo && !reduced && (
        <svg className="absolute h-0 w-0" aria-hidden>
          <defs>
            <filter id={filterId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(4, size * 0.16).toFixed(1)} result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" />
            </filter>
          </defs>
        </svg>
      )}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            blobRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 rounded-full will-change-transform"
          style={{ width: diameter(i), height: diameter(i), background: color }}
        />
      ))}
    </div>
  );
}
