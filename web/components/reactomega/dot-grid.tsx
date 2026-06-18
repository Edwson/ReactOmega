"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface DotGridProps {
  className?: string;
  /** Gap between dots in px. @default 28 */
  gap?: number;
  /** Base dot radius in px. @default 2 */
  dotSize?: number;
  /** Idle dot color. @default "rgba(255,255,255,.18)" */
  color?: string;
  /** Color of dots near the pointer. @default "#7c5cff" */
  active?: string;
  /** Pointer influence radius in px. @default 140 */
  radius?: number;
}

/**
 * DotGrid — an interactive dot field that lights up and swells around the
 * pointer. A modern, non-cosmic backdrop. For reduced-motion users it renders
 * a single static grid with no animation loop.
 */
export function DotGrid({
  className,
  gap = 28,
  dotSize = 2,
  color = "rgba(255,255,255,.18)",
  active = "#7c5cff",
  radius = 140,
}: DotGridProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let x = gap / 2; x < w; x += gap) {
        for (let y = gap / 2; y < h; y += gap) {
          const t = reduced ? 0 : Math.max(0, 1 - Math.hypot(x - mouse.x, y - mouse.y) / radius);
          ctx.beginPath();
          ctx.fillStyle = t > 0 ? active : color;
          ctx.globalAlpha = 0.35 + t * 0.65;
          ctx.arc(x, y, dotSize + t * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [gap, dotSize, color, active, radius, reduced]);

  return <canvas ref={ref} className={cn("h-full w-full", className)} />;
}
