"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface GravityWellsProps {
  /**
   * Number of particles in the field.
   * @default 400
   */
  count?: number;
  /**
   * Gravitational strength pulling particles toward the pointer.
   * @default 1200
   */
  strength?: number;
  /**
   * Particle color (hex).
   * @default "#7c5cff"
   */
  color?: string;
  /**
   * Trail persistence (0–1). Higher = longer luminous trails.
   * @default 0.12
   */
  trail?: number;
  /** Extra class names for the canvas element. */
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * GravityWells — ~400 particles orbit the pointer, which acts as a gravity
 * well with F ∝ 1/dist² (distance clamped to avoid blowups). A translucent
 * fade each frame leaves luminous orbital trails.
 */
export function GravityWells({
  count = 400,
  strength = 1200,
  color = "#7c5cff",
  trail = 0.12,
  className,
}: GravityWellsProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const N = Math.max(1, Math.min(count, 900));

    let cssW = 0;
    let cssH = 0;
    let raf = 0;
    let particles: Particle[] = [];
    const pointer = { x: 0, y: 0, active: false };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) {
        particles = Array.from({ length: N }, () => ({
          x: Math.random() * cssW,
          y: Math.random() * cssH,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
        }));
      }
      pointer.x = cssW / 2;
      pointer.y = cssH / 2;
    };

    const drawStatic = () => {
      ctx.fillStyle = "rgb(8, 8, 14)";
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.fillStyle = color;
      for (let i = 0; i < N; i++) {
        const x = Math.random() * cssW;
        const y = Math.random() * cssH;
        ctx.globalAlpha = 0.25 + Math.random() * 0.55;
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      // Fade instead of clear -> trails.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(8, 8, 14, ${trail})`;
      ctx.fillRect(0, 0, cssW, cssH);

      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = color;

      for (let i = 0; i < N; i++) {
        const p = particles[i];
        if (pointer.active) {
          let dx = pointer.x - p.x;
          let dy = pointer.y - p.y;
          let dist = Math.hypot(dx, dy);
          const clamped = Math.max(12, dist);
          const f = strength / (clamped * clamped);
          dx /= dist || 1;
          dy /= dist || 1;
          p.vx += dx * f;
          p.vy += dy * f;
          // Tangential nudge -> graceful orbits instead of straight infall.
          p.vx += -dy * f * 0.35;
          p.vy += dx * f * 0.35;
        } else {
          // Gentle drift toward center when idle.
          p.vx += (cssW / 2 - p.x) * 0.00002;
          p.vy += (cssH / 2 - p.y) * 0.00002;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        // Soft wrap.
        if (p.x < -20) p.x = cssW + 20;
        else if (p.x > cssW + 20) p.x = -20;
        if (p.y < -20) p.y = cssH + 20;
        else if (p.y > cssH + 20) p.y = -20;

        const speed = Math.min(1, Math.hypot(p.vx, p.vy) / 6);
        ctx.globalAlpha = 0.35 + speed * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + speed * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    build();

    if (reduced) {
      drawStatic();
      return;
    }

    // Seed background so first fade frames aren't transparent.
    ctx.fillStyle = "rgb(8, 8, 14)";
    ctx.fillRect(0, 0, cssW, cssH);

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", build);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", build);
    };
  }, [count, strength, color, trail, reduced]);

  return (
    <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />
  );
}
