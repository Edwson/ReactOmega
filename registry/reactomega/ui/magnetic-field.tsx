"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface MagneticFieldProps {
  /**
   * Spacing in pixels between filings on the grid.
   * @default 26
   */
  gap?: number;
  /**
   * Length in pixels of each filing line segment.
   * @default 11
   */
  length?: number;
  /**
   * Filing color (hex).
   * @default "#7c5cff"
   */
  color?: string;
  /** Extra class names for the canvas element. */
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * MagneticField — a grid of iron-filing line segments that orient along the
 * field of a dipole located at the pointer, re-aligning as it moves. Length
 * and brightness scale with proximity to the pole.
 */
export function MagneticField({
  gap = 26,
  length = 11,
  color = "#7c5cff",
  className,
}: MagneticFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const [cr, cg, cb] = hexToRgb(color);
    const g = Math.max(10, gap);

    let cssW = 0;
    let cssH = 0;
    let raf = 0;
    let points: { x: number; y: number }[] = [];
    // Dipole axis orientation (horizontal); the two poles straddle the pointer.
    const pole = { x: 0, y: 0, active: false };
    const target = { x: 0, y: 0 };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      points = [];
      const ox = (cssW % g) / 2 + g / 2;
      const oy = (cssH % g) / 2 + g / 2;
      for (let y = oy; y < cssH; y += g) {
        for (let x = ox; x < cssW; x += g) {
          points.push({ x, y });
        }
      }
      pole.x = cssW / 2;
      pole.y = cssH / 2;
      target.x = pole.x;
      target.y = pole.y;
    };

    // Dipole field direction at point (px,py). Moment along +x.
    const fieldDir = (px: number, py: number) => {
      const sep = g * 1.4;
      // Two opposite charges offset along the x axis.
      const dxp = px - (pole.x + sep);
      const dyp = py - pole.y;
      const dxn = px - (pole.x - sep);
      const dyn = py - pole.y;
      const rp = Math.max(8, Math.hypot(dxp, dyp));
      const rn = Math.max(8, Math.hypot(dxn, dyn));
      // Positive pole pushes out, negative pole pulls in.
      const fx = dxp / (rp * rp * rp) - dxn / (rn * rn * rn);
      const fy = dyp / (rp * rp * rp) - dyn / (rn * rn * rn);
      return { fx, fy };
    };

    const draw = (animated: boolean) => {
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.lineCap = "round";

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        let ang: number;
        let prox = 0;

        if (animated) {
          const { fx, fy } = fieldDir(p.x, p.y);
          ang = Math.atan2(fy, fx);
          const d = Math.hypot(p.x - pole.x, p.y - pole.y);
          prox = Math.max(0, 1 - d / (Math.max(cssW, cssH) * 0.5));
        } else {
          ang = 0; // neutral horizontal
        }

        const len = length * (0.7 + prox * 0.9);
        const half = len / 2;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const alpha = animated ? 0.22 + prox * 0.65 : 0.4;
        const w = animated ? 1 + prox * 1.4 : 1.1;

        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(p.x - ca * half, p.y - sa * half);
        ctx.lineTo(p.x + ca * half, p.y + sa * half);
        ctx.stroke();
      }
    };

    const loop = () => {
      // Ease pole toward pointer target for fluid re-alignment.
      pole.x += (target.x - pole.x) * 0.18;
      pole.y += (target.y - pole.y) * 0.18;
      draw(true);
      raf = requestAnimationFrame(loop);
    };

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      target.x = p.x;
      target.y = p.y;
      pole.active = true;
    };

    build();

    if (reduced) {
      draw(false);
      return;
    }

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    window.addEventListener("resize", build);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      window.removeEventListener("resize", build);
    };
  }, [gap, length, color, reduced]);

  return (
    <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />
  );
}
