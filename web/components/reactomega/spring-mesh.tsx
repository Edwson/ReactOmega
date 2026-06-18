"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface SpringMeshProps {
  className?: string;
  /** Px between nodes. @default 40 */
  gap?: number;
  /** Pull back to rest position, 0..1. @default 0.05 */
  stiffness?: number;
  /** Coupling to neighbors (what makes waves travel), 0..1. @default 0.08 */
  coupling?: number;
  /** Velocity damping, 0..1. @default 0.88 */
  damping?: number;
  /** Pointer push strength. @default 80 */
  pointerForce?: number;
  /** Pointer influence radius in px. @default 130 */
  pointerRadius?: number;
  /** Attract toward the pointer instead of pushing away. @default false */
  attract?: boolean;
  /** Node color. @default "#7c5cff" */
  dotColor?: string;
  /** Mesh line color. @default "rgba(124,92,255,.22)" */
  lineColor?: string;
  /** Node radius in px. @default 2 */
  dotSize?: number;
}

/**
 * SpringMesh — an elastic lattice. Every node is sprung to its rest spot and
 * coupled to its neighbors, so pressing the pointer into the sheet sends real
 * waves rippling outward that settle naturally. A static grid for reduced-motion.
 */
export function SpringMesh({
  className,
  gap = 40,
  stiffness = 0.05,
  coupling = 0.08,
  damping = 0.88,
  pointerForce = 80,
  pointerRadius = 130,
  attract = false,
  dotColor = "#7c5cff",
  lineColor = "rgba(124,92,255,.22)",
  dotSize = 2,
}: SpringMeshProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, cols = 0, rows = 0;
    let nodes: { x: number; y: number; ox: number; oy: number; vx: number; vy: number }[] = [];
    const mouse = { x: -9999, y: -9999, down: false };
    let raf = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(2, Math.floor(w / gap) + 1);
      rows = Math.max(2, Math.floor(h / gap) + 1);
      const ox = (w - (cols - 1) * gap) / 2;
      const oy = (h - (rows - 1) * gap) / 2;
      nodes = [];
      for (let r2 = 0; r2 < rows; r2++)
        for (let c = 0; c < cols; c++) {
          const x = ox + c * gap, y = oy + r2 * gap;
          nodes.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
        }
    };
    const at = (c: number, r2: number) => nodes[r2 * cols + c];

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // physics
      for (let r2 = 0; r2 < rows; r2++) {
        for (let c = 0; c < cols; c++) {
          const n = at(c, r2);
          let ax = (n.ox - n.x) * stiffness;
          let ay = (n.oy - n.y) * stiffness;
          const neigh = [[c - 1, r2], [c + 1, r2], [c, r2 - 1], [c, r2 + 1]];
          for (const [nc, nr] of neigh) {
            if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
            const m = at(nc, nr);
            ax += (m.x - (m.ox - n.ox) - n.x) * coupling;
            ay += (m.y - (m.oy - n.oy) - n.y) * coupling;
          }
          const dx = n.x - mouse.x, dy = n.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < pointerRadius && dist > 0.001) {
            const f = (pointerForce * (1 - dist / pointerRadius)) / dist;
            const sign = attract ? -1 : 1;
            ax += sign * dx * f * 0.02;
            ay += sign * dy * f * 0.02;
          }
          n.vx = (n.vx + ax) * damping;
          n.vy = (n.vy + ay) * damping;
          if (!reduced) { n.x += n.vx; n.y += n.vy; }
        }
      }
      // lines
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let r2 = 0; r2 < rows; r2++)
        for (let c = 0; c < cols; c++) {
          const n = at(c, r2);
          if (c < cols - 1) { ctx.moveTo(n.x, n.y); const m = at(c + 1, r2); ctx.lineTo(m.x, m.y); }
          if (r2 < rows - 1) { ctx.moveTo(n.x, n.y); const m = at(c, r2 + 1); ctx.lineTo(m.x, m.y); }
        }
      ctx.stroke();
      // dots
      ctx.fillStyle = dotColor;
      for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, dotSize, 0, Math.PI * 2); ctx.fill(); }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    build();
    draw();
    window.addEventListener("resize", build);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [gap, stiffness, coupling, damping, pointerForce, pointerRadius, attract, dotColor, lineColor, dotSize, reduced]);

  return <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />;
}
