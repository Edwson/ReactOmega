"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface FallingSandProps {
  className?: string;
  /** Cell size in px (smaller = finer sand, more cells). @default 5 */
  cell?: number;
  /** Grain color palette. @default a few violets / cyans / pinks */
  colors?: string[];
  /** Brush radius in cells. @default 2 */
  brush?: number;
}

/**
 * FallingSand — a falling-sand cellular automaton. Drag the pointer to pour
 * grains; each tick they fall straight down or slide diagonally into empty
 * cells, piling into realistic mounds. Renders a static pre-filled mound when
 * reduced motion is requested (no simulation loop).
 */
export function FallingSand({
  className,
  cell = 5,
  colors = ["#7c5cff", "#a78bfa", "#22d3ee", "#38bdf8", "#f472b6", "#fb7185"],
  brush = 2,
}: FallingSandProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sz = Math.max(2, Math.floor(cell));
    const palette = colors.length ? colors : ["#7c5cff"];
    let w = 0, h = 0, cols = 0, rows = 0;
    // grid stores color index + 1 (0 = empty)
    let grid: Int16Array = new Int16Array(0);
    const mouse = { x: -9999, y: -9999, down: false };
    let raf = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(w / sz));
      rows = Math.max(1, Math.floor(h / sz));
      // cap total cells ~24000
      while (cols * rows > 24000) {
        if (cols >= rows) cols--; else rows--;
      }
      grid = new Int16Array(cols * rows);
    };

    const idx = (c: number, r: number) => r * cols + c;

    const paint = () => {
      const c0 = Math.floor(mouse.x / sz);
      const r0 = Math.floor(mouse.y / sz);
      for (let dr = -brush; dr <= brush; dr++)
        for (let dc = -brush; dc <= brush; dc++) {
          if (dc * dc + dr * dr > brush * brush) continue;
          const c = c0 + dc, r = r0 + dr;
          if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
          if (grid[idx(c, r)] === 0 && Math.random() < 0.6) {
            grid[idx(c, r)] = 1 + Math.floor(Math.random() * palette.length);
          }
        }
    };

    const step = () => {
      // scan bottom-up so grains move one cell per tick
      for (let r = rows - 2; r >= 0; r--) {
        for (let c = 0; c < cols; c++) {
          const v = grid[idx(c, r)];
          if (v === 0) continue;
          // straight down
          if (grid[idx(c, r + 1)] === 0) {
            grid[idx(c, r + 1)] = v; grid[idx(c, r)] = 0; continue;
          }
          // diagonal slide, randomized order
          const leftFirst = Math.random() < 0.5;
          const dirs = leftFirst ? [-1, 1] : [1, -1];
          let moved = false;
          for (const d of dirs) {
            const nc = c + d;
            if (nc < 0 || nc >= cols) continue;
            if (grid[idx(nc, r + 1)] === 0) {
              grid[idx(nc, r + 1)] = v; grid[idx(c, r)] = 0; moved = true; break;
            }
          }
          if (moved) continue;
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const v = grid[idx(c, r)];
          if (v === 0) continue;
          ctx.fillStyle = palette[(v - 1) % palette.length];
          ctx.fillRect(c * sz, r * sz, sz, sz);
        }
    };

    const loop = () => {
      if (mouse.down) paint();
      step();
      render();
      raf = requestAnimationFrame(loop);
    };

    const staticMound = () => {
      // pre-fill a triangular mound at the bottom for reduced motion
      const peakC = Math.floor(cols / 2);
      const maxH = Math.floor(rows * 0.45);
      for (let c = 0; c < cols; c++) {
        const dist = Math.abs(c - peakC);
        const colH = Math.max(0, maxH - dist);
        for (let k = 0; k < colH; k++) {
          const r = rows - 1 - k;
          if (r >= 0) grid[idx(c, r)] = 1 + ((c + k) % palette.length);
        }
      }
      render();
    };

    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; if (!mouse.down) paint(); };
    const onDown = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.down = true; canvas.setPointerCapture?.(e.pointerId); };
    const onUp = () => { mouse.down = false; };
    const onLeave = () => { mouse.down = false; mouse.x = -9999; mouse.y = -9999; };

    build();
    if (reduced) {
      staticMound();
    } else {
      render();
      raf = requestAnimationFrame(loop);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", build);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [cell, colors, brush, reduced]);

  return <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />;
}
