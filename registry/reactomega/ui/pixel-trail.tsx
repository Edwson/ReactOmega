"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface PixelTrailProps {
  className?: string;
  /** Edge length of one cell in px. @default 12 */
  pixelSize?: number;
  /** Lit pixel color. @default "#7c5cff" */
  color?: string;
  /** Brightness kept per frame, 0..1 — higher leaves a longer comet. @default 0.9 */
  decay?: number;
  /** Bloom strength around lit pixels; 0 disables it. @default 0.6 */
  glow?: number;
  /** Space between cells in px. @default 2 */
  gap?: number;
}

/**
 * PixelTrail — a grid of square cells that ignite to full brightness as the
 * pointer crosses them and then decay exponentially, leaving a dissolving comet
 * of pixels behind the cursor.
 *
 * Cells are lit by walking the segment between the previous and current pointer
 * position at half-cell steps rather than by lighting whatever sits under the
 * latest event. A mouse reporting at 60Hz can travel hundreds of px between two
 * events, and per-event lighting turns a fast flick into a dotted line; segment
 * interpolation keeps the path continuous at any speed, with the sample count
 * capped so a window-wide jump cannot spike a frame.
 *
 * Brightness lives in a single Float32Array multiplied by `decay` each frame —
 * at the default that is a ~110ms half life. Only cells above the visible
 * threshold are painted, in two passes (an additive bloom pass, then the crisp
 * cores) so the composite mode is set twice per frame instead of twice per pixel.
 * The loop stops the moment the grid is dark and restarts on the next move.
 * Reduced motion and coarse pointers get the same grid rendered once, unlit and
 * static, so the surface still reads as a textured panel.
 */
export function PixelTrail({
  className,
  pixelSize = 12,
  color = "#7c5cff",
  decay = 0.9,
  glow = 0.6,
  gap = 2,
}: PixelTrailProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fine, setFine] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cell = Math.max(1, pixelSize);
    const step = cell + Math.max(0, gap);
    const fade = Math.min(0.985, Math.max(0.5, decay));
    const still = reduced || !fine;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let buf = new Float32Array(0);
    let raf = 0;
    let running = false;
    let lastX = -1;
    let lastY = -1;

    const paintStatic = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = color;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) ctx.fillRect(x * step, y * step, cell, cell);
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.ceil(w / step));
      rows = Math.max(1, Math.ceil(h / step));
      buf = new Float32Array(cols * rows);
      if (still) paintStatic();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;

      // Pass 1 — additive bloom, laid down under the cores.
      if (glow > 0) {
        ctx.globalCompositeOperation = "lighter";
        const pad = cell * 0.55;
        for (let i = 0; i < buf.length; i++) {
          const v = buf[i];
          if (v < 0.02) continue;
          ctx.globalAlpha = Math.min(1, v * 0.3 * glow);
          ctx.fillRect((i % cols) * step - pad, Math.floor(i / cols) * step - pad, cell + pad * 2, cell + pad * 2);
        }
      }

      // Pass 2 — crisp cores, plus the decay sweep for every cell.
      ctx.globalCompositeOperation = "source-over";
      let lit = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = buf[i];
        if (v < 0.02) {
          if (v !== 0) buf[i] = 0;
          continue;
        }
        lit++;
        ctx.globalAlpha = Math.min(1, v);
        ctx.fillRect((i % cols) * step, Math.floor(i / cols) * step, cell, cell);
        buf[i] = v * fade;
      }

      ctx.globalAlpha = 1;
      if (lit > 0) raf = requestAnimationFrame(draw);
      else running = false;
    };

    const ensure = () => {
      if (still || running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };

    const ignite = (x0: number, y0: number, x1: number, y1: number) => {
      const dist = Math.hypot(x1 - x0, y1 - y0);
      const samples = Math.min(240, Math.max(1, Math.ceil(dist / (step * 0.5))));
      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const cx = Math.floor((x0 + (x1 - x0) * t) / step);
        const cy = Math.floor((y0 + (y1 - y0) * t) / step);
        if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) continue;
        buf[cy * cols + cx] = 1;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (still) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (lastX < 0) ignite(x, y, x, y);
      else ignite(lastX, lastY, x, y);
      lastX = x;
      lastY = y;
      ensure();
    };
    // Break the path on both enter and leave so re-entering the panel does not
    // draw a streak across it from wherever the pointer left.
    const breakPath = () => {
      lastX = -1;
      lastY = -1;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerenter", breakPath);
    canvas.addEventListener("pointerleave", breakPath);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerenter", breakPath);
      canvas.removeEventListener("pointerleave", breakPath);
    };
  }, [pixelSize, color, decay, glow, gap, reduced, fine]);

  return <canvas ref={ref} aria-hidden className={cn("h-full w-full", className)} />;
}
