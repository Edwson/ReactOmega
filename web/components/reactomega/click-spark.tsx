"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ClickSparkProps {
  children?: React.ReactNode;
  className?: string;
  /** Spark color. @default "#7c5cff" */
  color?: string;
  /** Number of sparks per click. @default 10 */
  count?: number;
  /** Spark length in px. @default 14 */
  size?: number;
  /** Animation length in ms. @default 500 */
  duration?: number;
}

/**
 * ClickSpark — emits a quick radial spark burst from the exact click point,
 * drawn on a self-clearing canvas overlay. No sparks for reduced-motion users.
 */
export function ClickSpark({
  children,
  className,
  color = "#7c5cff",
  count = 10,
  size = 14,
  duration = 500,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const start = performance.now();
      const angles = Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2);
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);

      const frame = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        const reach = 26 * ease(p);
        angles.forEach((a) => {
          const x1 = x + Math.cos(a) * reach;
          const y1 = y + Math.sin(a) * reach;
          const x2 = x + Math.cos(a) * (reach + size * (1 - p));
          const y2 = y + Math.sin(a) * (reach + size * (1 - p));
          ctx.globalAlpha = 1 - p;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });
        if (p < 1) requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, rect.width, rect.height);
      };
      requestAnimationFrame(frame);
    },
    [color, count, size, duration, reduced],
  );

  return (
    <div onClick={onClick} className={cn("relative inline-block", className)}>
      {children}
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
