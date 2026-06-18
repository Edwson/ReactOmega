"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ClothProps {
  className?: string;
  /** Grid columns. @default 16 */
  cols?: number;
  /** Grid rows. @default 11 */
  rows?: number;
  /** Downward pull per frame. @default 0.4 */
  gravity?: number;
  /** Constraint relaxation passes (higher = stiffer fabric). @default 3 */
  iterations?: number;
  /** Velocity retained per frame, 0..1. @default 0.99 */
  damping?: number;
  /** Grab radius in px. @default 44 */
  dragRadius?: number;
  /** Thread color. @default "rgba(124,92,255,.55)" */
  color?: string;
}

/**
 * Cloth — a real verlet-integrated fabric. It hangs from a pinned top edge under
 * gravity; grab any point and it folds, swings, and settles like cloth. Drawn as
 * a thread mesh. For reduced-motion users it renders a still, flat panel.
 */
export function Cloth({
  className,
  cols = 16,
  rows = 11,
  gravity = 0.4,
  iterations = 3,
  damping = 0.99,
  dragRadius = 44,
  color = "rgba(124,92,255,.55)",
}: ClothProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, spacing = 0;
    type P = { x: number; y: number; px: number; py: number; pin: boolean };
    let pts: P[] = [];
    let links: [number, number, number][] = []; // a, b, restLength
    const mouse = { x: -9999, y: -9999, down: false, grab: -1 };
    let raf = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const clothW = Math.min(w * 0.86, h * 0.95 * (cols / rows));
      spacing = clothW / (cols - 1);
      const startX = (w - clothW) / 2;
      const startY = Math.max(8, h * 0.08);
      pts = [];
      for (let r2 = 0; r2 < rows; r2++)
        for (let c = 0; c < cols; c++) {
          const x = startX + c * spacing, y = startY + r2 * spacing;
          pts.push({ x, y, px: x, py: y, pin: r2 === 0 && (c % 3 === 0 || c === cols - 1) });
        }
      links = [];
      const idx = (c: number, r2: number) => r2 * cols + c;
      for (let r2 = 0; r2 < rows; r2++)
        for (let c = 0; c < cols; c++) {
          if (c < cols - 1) links.push([idx(c, r2), idx(c + 1, r2), spacing]);
          if (r2 < rows - 1) links.push([idx(c, r2), idx(c, r2 + 1), spacing]);
        }
    };

    const draw = () => {
      if (!reduced) {
        for (const p of pts) {
          if (p.pin) continue;
          const vx = (p.x - p.px) * damping, vy = (p.y - p.py) * damping;
          p.px = p.x; p.py = p.y;
          p.x += vx; p.y += vy + gravity;
        }
        if (mouse.down && mouse.grab >= 0) {
          const g = pts[mouse.grab];
          g.x = mouse.x; g.y = mouse.y; g.px = mouse.x; g.py = mouse.y;
        }
        for (let it = 0; it < iterations; it++) {
          for (const [a, b, rest] of links) {
            const pa = pts[a], pb = pts[b];
            const dx = pb.x - pa.x, dy = pb.y - pa.y;
            const d = Math.hypot(dx, dy) || 0.001;
            const diff = ((rest - d) / d) * 0.5;
            const ox = dx * diff, oy = dy * diff;
            if (!pa.pin) { pa.x -= ox; pa.y -= oy; }
            if (!pb.pin) { pb.x += ox; pb.y += oy; }
          }
        }
      }
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const [a, b] of links) { ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); }
      ctx.stroke();
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const rel = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const onMove = (e: PointerEvent) => { const m = rel(e); mouse.x = m.x; mouse.y = m.y; };
    const onDown = (e: PointerEvent) => {
      const m = rel(e); mouse.x = m.x; mouse.y = m.y; mouse.down = true;
      let best = -1, bestD = dragRadius;
      pts.forEach((p, i) => { const d = Math.hypot(p.x - m.x, p.y - m.y); if (d < bestD) { bestD = d; best = i; } });
      mouse.grab = best;
    };
    const onUp = () => { mouse.down = false; mouse.grab = -1; };

    build();
    draw();
    window.addEventListener("resize", build);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [cols, rows, gravity, iterations, damping, dragRadius, color, reduced]);

  return <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />;
}
