"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface PluckedStringProps {
  className?: string;
  /** Number of points along the string. @default 90 */
  points?: number;
  /** Wave restoring strength, 0..1. @default 0.4 */
  tension?: number;
  /** Velocity damping per frame (closer to 1 = longer sustain). @default 0.995 */
  damping?: number;
  /** String color. @default "#22d3ee" */
  color?: string;
  /** Line thickness in px. @default 3 */
  thickness?: number;
}

/**
 * PluckedString — a string pinned at both ends. Press down near it to grab the
 * nearest point, drag to pluck, release to let it vibrate: each interior point
 * accelerates toward the average of its neighbors, producing a realistic decaying
 * wave. Renders a straight horizontal string when reduced motion is requested.
 */
export function PluckedString({
  className,
  points = 90,
  tension = 0.4,
  damping = 0.995,
  color = "#22d3ee",
  thickness = 3,
}: PluckedStringProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const n = Math.max(8, Math.min(200, Math.floor(points)));
    let w = 0, h = 0, baseY = 0, step = 0;
    let pos: number[] = [];
    let vel: number[] = [];
    let grab = -1;
    let raf = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseY = h / 2;
      step = w / (n - 1);
      pos = new Array(n).fill(baseY);
      vel = new Array(n).fill(0);
      grab = -1;
    };

    const physics = () => {
      for (let i = 1; i < n - 1; i++) {
        if (i === grab) continue;
        const target = (pos[i - 1] + pos[i + 1]) / 2;
        vel[i] += (target - pos[i]) * tension;
        vel[i] *= damping;
      }
      for (let i = 1; i < n - 1; i++) {
        if (i === grab) continue;
        pos[i] += vel[i];
      }
      pos[0] = baseY; pos[n - 1] = baseY;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (!reduced) physics();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      // soft glow underlay
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(0, pos[0]);
      for (let i = 1; i < n; i++) {
        const x = i * step;
        const px = (i - 1) * step;
        const cpx = (px + x) / 2;
        ctx.quadraticCurveTo(px, pos[i - 1], cpx, (pos[i - 1] + pos[i]) / 2);
      }
      ctx.lineTo(w, pos[n - 1]);
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const idxFromX = (x: number) => Math.max(0, Math.min(n - 1, Math.round(x / step)));

    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const i = idxFromX(x);
      if (i <= 0 || i >= n - 1) return;
      if (Math.abs(y - pos[i]) < 60) { grab = i; pos[i] = y; vel[i] = 0; canvas.setPointerCapture?.(e.pointerId); }
    };
    const onMove = (e: PointerEvent) => {
      if (grab < 0) return;
      const r = canvas.getBoundingClientRect();
      pos[grab] = e.clientY - r.top;
      vel[grab] = 0;
    };
    const onUp = () => { grab = -1; };

    build();
    draw();
    window.addEventListener("resize", build);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onUp);
    };
  }, [points, tension, damping, color, thickness, reduced]);

  return <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />;
}
