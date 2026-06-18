"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface SoftBodyProps {
  className?: string;
  /** Number of points around the ring. @default 24 */
  points?: number;
  /** Spring strength pulling points back to rest, 0..1. @default 0.2 */
  stiffness?: number;
  /** Velocity damping, 0..1 (higher = looser jelly). @default 0.85 */
  damping?: number;
  /** Rest radius as a fraction of min(width, height). @default 0.28 */
  radius?: number;
  /** Blob color. @default "#7c5cff" */
  color?: string;
  /** Pointer repel radius in px. @default 90 */
  pointerRadius?: number;
}

/**
 * SoftBody — a poke-able jelly blob. A ring of points is held in a circle by
 * perimeter springs, radius springs to the center, and a light outward pressure.
 * The pointer repels nearby points so you can squish it and watch it wobble back.
 * Renders a single static circle when reduced motion is requested.
 */
export function SoftBody({
  className,
  points = 24,
  stiffness = 0.2,
  damping = 0.85,
  radius = 0.28,
  color = "#7c5cff",
  pointerRadius = 90,
}: SoftBodyProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const n = Math.max(8, Math.min(64, Math.floor(points)));
    let w = 0, h = 0, cx = 0, cy = 0, rest = 0, edge = 0;
    type P = { x: number; y: number; vx: number; vy: number; ang: number };
    let ring: P[] = [];
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2; cy = h / 2;
      rest = Math.min(w, h) * radius;
      edge = 2 * rest * Math.sin(Math.PI / n);
      ring = [];
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2;
        ring.push({ x: cx + Math.cos(ang) * rest, y: cy + Math.sin(ang) * rest, vx: 0, vy: 0, ang });
      }
    };

    const physics = () => {
      // pressure: average distance from center, push outward to stay round
      let avg = 0;
      for (const p of ring) avg += Math.hypot(p.x - cx, p.y - cy);
      avg /= n;
      for (let i = 0; i < n; i++) {
        const p = ring[i];
        const prev = ring[(i - 1 + n) % n];
        const next = ring[(i + 1) % n];
        let ax = 0, ay = 0;
        // radius spring to center
        const dxc = cx - p.x, dyc = cy - p.y;
        const dc = Math.hypot(dxc, dyc) || 0.001;
        ax += (dxc / dc) * (dc - rest) * stiffness;
        ay += (dyc / dc) * (dc - rest) * stiffness;
        // perimeter springs to two neighbors (rest = edge length)
        for (const nb of [prev, next]) {
          const dx = nb.x - p.x, dy = nb.y - p.y;
          const d = Math.hypot(dx, dy) || 0.001;
          ax += (dx / d) * (d - edge) * stiffness * 0.5;
          ay += (dy / d) * (d - edge) * stiffness * 0.5;
        }
        // internal pressure: push outward when blob is compressed
        const pr = (rest - avg) * 0.04;
        ax += (-dxc / dc) * pr;
        ay += (-dyc / dc) * pr;
        // pointer repel
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < pointerRadius && md > 0.001) {
          const f = (1 - md / pointerRadius) * 6;
          ax += (mdx / md) * f;
          ay += (mdy / md) * f;
        }
        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;
      }
      for (const p of ring) { p.x += p.vx; p.y += p.vy; }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (!reduced) physics();
      // smooth closed shape through ring points via quadratic midpoints
      ctx.beginPath();
      const mid = (a: P, b: P) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      let m0 = mid(ring[n - 1], ring[0]);
      ctx.moveTo(m0.x, m0.y);
      for (let i = 0; i < n; i++) {
        const cur = ring[i];
        const m1 = mid(cur, ring[(i + 1) % n]);
        ctx.quadraticCurveTo(cur.x, cur.y, m1.x, m1.y);
      }
      ctx.closePath();
      ctx.fillStyle = withAlpha(color, 0.22);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const withAlpha = (c: string, a: number) => {
      const m = c.match(/^#?([0-9a-f]{6})$/i);
      if (m) {
        const num = parseInt(m[1], 16);
        return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${a})`;
      }
      return c;
    };

    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    build();
    draw();
    window.addEventListener("resize", build);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [points, stiffness, damping, radius, color, pointerRadius, reduced]);

  return <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />;
}
