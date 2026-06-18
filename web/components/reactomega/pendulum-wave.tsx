"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface PendulumWaveProps {
  className?: string;
  /** Number of pendulums in the row. @default 15 */
  count?: number;
  /** Seconds for the whole pattern to drift apart and re-sync. @default 14 */
  cycle?: number;
  /** Swing amplitude in radians (~0.5 ≈ 29°). @default 0.5 */
  amplitude?: number;
  /** Line + bob color. @default "#7c5cff" */
  color?: string;
  /** Bob circle radius in px. @default 6 */
  bobRadius?: number;
}

/**
 * PendulumWave — a row of pendulums hung from a top bar, each a little longer
 * than the last. Their periods are spaced harmonically (the shortest swings
 * exactly one more time per cycle than its neighbour), so they sweep through
 * the classic traveling-wave "dance" and re-sync every `cycle` seconds. Uses
 * closed-form simple-harmonic motion — smooth and rock-stable, never chaotic.
 * Reduced-motion users see every pendulum hanging vertical at rest.
 */
export function PendulumWave({
  className,
  count = 15,
  cycle = 14,
  amplitude = 0.5,
  color = "#7c5cff",
  bobRadius = 6,
}: PendulumWaveProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, barY = 0;
    type Pen = { len: number; x: number; omega: number };
    let pens: Pen[] = [];
    let raf = 0;
    let start = 0;
    // The slowest pendulum completes this many swings per cycle; each shorter
    // one does one more. The spread of frequencies is what makes the wave.
    const minSwings = 8;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      barY = Math.max(10, h * 0.1);
      const usableH = h - barY - bobRadius - 8;
      const topLen = usableH * 0.5;
      const lenStep = (usableH - topLen) / Math.max(1, count - 1);
      const margin = Math.max(bobRadius + 6, w * 0.07);
      const span = w - margin * 2;
      pens = [];
      for (let i = 0; i < count; i++) {
        const len = topLen + i * lenStep; // i=0 shortest → swings fastest
        const x = count === 1 ? w / 2 : margin + (span * i) / (count - 1);
        const swings = minSwings + (count - 1 - i); // shorter = more swings
        const omega = (2 * Math.PI * swings) / cycle;
        pens.push({ len, x, omega });
      }
    };

    const draw = (t: number) => {
      if (!start) start = t;
      const elapsed = reduced ? 0 : (t - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      // top bar
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pens[0]?.x ?? 0, barY);
      ctx.lineTo(pens[pens.length - 1]?.x ?? w, barY);
      ctx.stroke();
      for (const p of pens) {
        const a = reduced ? 0 : amplitude * Math.cos(p.omega * elapsed);
        const bx = p.x + Math.sin(a) * p.len;
        const by = barY + Math.cos(a) * p.len;
        ctx.strokeStyle = "rgba(124,92,255,.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, barY);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(bx, by, bobRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    build();
    if (reduced) draw(0);
    else raf = requestAnimationFrame(draw);
    window.addEventListener("resize", build);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
    };
  }, [count, cycle, amplitude, color, bobRadius, reduced]);

  return <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />;
}
