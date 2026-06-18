"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface RopeProps {
  className?: string;
  /** Number of rope segments (more = smoother, heavier). @default 16 */
  segments?: number;
  /** Downward pull added to each point per frame. @default 0.5 */
  gravity?: number;
  /** Velocity retained per frame, 0..1 (lower = more drag). @default 0.99 */
  damping?: number;
  /** Constraint relaxation passes per frame (higher = stiffer rope). @default 10 */
  iterations?: number;
  /** Stroke thickness in px. @default 4 */
  thickness?: number;
  /** Rope color. @default "#7c5cff" */
  color?: string;
}

/**
 * Rope — a verlet-integrated rope/chain hanging from a fixed top-center anchor.
 * Grab the nearest point and drag it; release and it swings and settles under
 * gravity. Drawn as a thick, round-capped polyline. For reduced-motion users it
 * renders the rope hanging straight down at rest.
 */
export function Rope({
  className,
  segments = 16,
  gravity = 0.5,
  damping = 0.99,
  iterations = 10,
  thickness = 4,
  color = "#7c5cff",
}: RopeProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, rest = 0;
    type P = { x: number; y: number; px: number; py: number; pin: boolean };
    let pts: P[] = [];
    const mouse = { x: -9999, y: -9999, down: false, grab: -1 };
    let raf = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const anchorX = w / 2;
      const anchorY = Math.max(8, h * 0.08);
      const ropeLen = Math.min(h * 0.78, h - anchorY - 12);
      rest = ropeLen / segments;
      pts = [];
      for (let i = 0; i <= segments; i++) {
        const y = anchorY + i * rest;
        pts.push({ x: anchorX, y, px: anchorX, py: y, pin: i === 0 });
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
          for (let i = 0; i < segments; i++) {
            const pa = pts[i], pb = pts[i + 1];
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
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      // anchor knob
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, thickness * 1.4, 0, Math.PI * 2);
      ctx.fill();
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const rel = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const onMove = (e: PointerEvent) => { const m = rel(e); mouse.x = m.x; mouse.y = m.y; };
    const onDown = (e: PointerEvent) => {
      const m = rel(e); mouse.x = m.x; mouse.y = m.y; mouse.down = true;
      let best = -1, bestD = Infinity;
      pts.forEach((p, i) => { if (p.pin) return; const d = Math.hypot(p.x - m.x, p.y - m.y); if (d < bestD) { bestD = d; best = i; } });
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
  }, [segments, gravity, damping, iterations, thickness, color, reduced]);

  return <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />;
}
