"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface WaterRippleProps {
  /**
   * Wave damping factor (0–1). Higher = ripples persist longer.
   * @default 0.96
   */
  damping?: number;
  /**
   * Pixels per simulation grid cell. Smaller = finer (heavier) simulation.
   * @default 7
   */
  cell?: number;
  /**
   * Water tint color (hex).
   * @default "#22d3ee"
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
 * WaterRipple — a height-field water surface simulated on a grid with two
 * height buffers. Pointer input injects disturbances that spread and reflect
 * off the edges; shading is derived from the local height gradient.
 */
export function WaterRipple({
  damping = 0.96,
  cell = 7,
  color = "#22d3ee",
  className,
}: WaterRippleProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const [cr, cg, cb] = hexToRgb(color);

    let cols = 0;
    let rows = 0;
    let cssW = 0;
    let cssH = 0;
    let cellPx = Math.max(3, cell);
    let prev: Float32Array = new Float32Array(0);
    let cur: Float32Array = new Float32Array(0);
    let image: ImageData | null = null;
    let raf = 0;
    let pointer = { x: -1, y: -1, active: false };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Choose cell size so cols*rows stays under ~16000.
      cellPx = Math.max(3, cell);
      cols = Math.max(8, Math.floor(cssW / cellPx));
      rows = Math.max(8, Math.floor(cssH / cellPx));
      while (cols * rows > 16000) {
        cellPx += 1;
        cols = Math.max(8, Math.floor(cssW / cellPx));
        rows = Math.max(8, Math.floor(cssH / cellPx));
      }

      prev = new Float32Array(cols * rows);
      cur = new Float32Array(cols * rows);
      image = ctx.createImageData(cols, rows);
    };

    const disturb = (px: number, py: number, amp: number) => {
      const gx = Math.floor((px / cssW) * cols);
      const gy = Math.floor((py / cssH) * rows);
      const r = 2;
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          const cx = gx + x;
          const cy = gy + y;
          if (cx < 1 || cy < 1 || cx >= cols - 1 || cy >= rows - 1) continue;
          const fall = 1 - Math.min(1, Math.hypot(x, y) / (r + 0.5));
          cur[cy * cols + cx] += amp * fall;
        }
      }
    };

    const step = () => {
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const i = y * cols + x;
          const sum =
            cur[i - 1] + cur[i + 1] + cur[i - cols] + cur[i + cols];
          prev[i] = (sum / 2 - prev[i]) * damping;
        }
      }
      const t = prev;
      prev = cur;
      cur = t;
    };

    const render = () => {
      if (!image) return;
      const data = image.data;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const h = cur[i];
          // Gradient-based shading (specular off the slope).
          const dx = x > 0 && x < cols - 1 ? cur[i - 1] - cur[i + 1] : 0;
          const dy = y > 0 && y < rows - 1 ? cur[i - cols] - cur[i + cols] : 0;
          const slope = dx * 0.9 + dy * 0.45;
          const base = 26 + h * 1.6;
          const spec = Math.max(0, slope) * 14;
          const lum = Math.max(0, Math.min(1, (base + spec) / 110));
          const o = i * 4;
          data[o] = Math.min(255, cr * lum + spec * 1.4);
          data[o + 1] = Math.min(255, cg * lum + spec * 1.4);
          data[o + 2] = Math.min(255, cb * lum * 0.9 + 30 + spec);
          data[o + 3] = 255;
        }
      }
      // Upscale the low-res grid onto the canvas.
      ctx.imageSmoothingEnabled = true;
      ctx.putImageData(image, 0, 0);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(
        canvas,
        0,
        0,
        cols,
        rows,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      ctx.restore();
    };

    const staticFrame = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, cssH);
      g.addColorStop(0, `rgba(${cr * 0.22}, ${cg * 0.28}, ${cb * 0.32}, 1)`);
      g.addColorStop(1, "rgb(12, 18, 24)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cssW, cssH);
    };

    const loop = () => {
      if (pointer.active) disturb(pointer.x, pointer.y, 220);
      step();
      render();
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
      disturb(p.x, p.y, 120);
    };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = true;
      disturb(p.x, p.y, 320);
    };
    const onLeave = () => {
      pointer.active = false;
    };

    build();

    if (reduced) {
      staticFrame();
      return;
    }

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", build);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", build);
    };
  }, [damping, cell, color, reduced]);

  return (
    <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />
  );
}
