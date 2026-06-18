"use client";

import { useLayoutEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface GravityTextProps {
  text: string;
  /** What makes the letters fall. @default "hover" */
  trigger?: "hover" | "click" | "load";
  /** Downward acceleration (px/frame²). @default 0.6 */
  gravity?: number;
  /** Floor restitution, 0..1. @default 0.55 */
  bounce?: number;
  /** Horizontal damping on bounce, 0..1. @default 0.9 */
  friction?: number;
  /** Initial random sideways kick. @default 4 */
  scatter?: number;
  /** Reassemble when released (hover/click). @default true */
  reset?: boolean;
  className?: string;
  /** Element to render as. @default "span" */
  as?: ElementType;
}

/**
 * GravityText — each letter detaches and falls under real gravity, bounces off
 * the floor with friction, then springs back into place. Measured then absolutely
 * positioned so the resting text is pixel-identical. Static for reduced-motion.
 */
export function GravityText({
  text,
  trigger = "hover",
  gravity = 0.6,
  bounce = 0.55,
  friction = 0.9,
  scatter = 4,
  reset = true,
  className,
  as: Tag = "span",
}: GravityTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const origins = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const phys = useRef<{ dx: number; dy: number; vx: number; vy: number }[]>([]);
  const raf = useRef(0);
  const mode = useRef<"idle" | "fall" | "return">("idle");
  const reduced = usePrefersReducedMotion();

  const chars = Array.from(text);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    origins.current = charRefs.current.map((s) => {
      const r = s!.getBoundingClientRect();
      return { x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height };
    });
    phys.current = chars.map(() => ({ dx: 0, dy: 0, vx: 0, vy: 0 }));
    setBox({ w: cr.width, h: cr.height });
    if (trigger === "load" && !reduced) requestAnimationFrame(fall);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const apply = () => {
    charRefs.current.forEach((s, i) => {
      const p = phys.current[i];
      if (s) s.style.transform = `translate(${p.dx.toFixed(2)}px, ${p.dy.toFixed(2)}px)`;
    });
  };

  function fall() {
    mode.current = "fall";
    const b = containerRef.current?.getBoundingClientRect();
    const H = b?.height ?? box?.h ?? 0;
    const W = b?.width ?? box?.w ?? 0;
    // kick once on entering fall
    phys.current.forEach((p) => {
      if (p.vx === 0 && p.vy === 0 && p.dy === 0) {
        p.vx = (Math.random() - 0.5) * 2 * scatter;
        p.vy = Math.random() * -2;
      }
    });
    const loop = () => {
      let active = false;
      phys.current.forEach((p, i) => {
        const o = origins.current[i];
        p.vy += gravity;
        p.dx += p.vx;
        p.dy += p.vy;
        const floor = H - o.h - o.y;
        if (p.dy > floor) {
          p.dy = floor;
          p.vy *= -bounce;
          p.vx *= friction;
          if (Math.abs(p.vy) < 0.6) p.vy = 0;
        }
        const left = -o.x;
        const right = W - o.w - o.x;
        if (p.dx < left) { p.dx = left; p.vx *= -friction; }
        if (p.dx > right) { p.dx = right; p.vx *= -friction; }
        if (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1 || p.dy < floor - 0.5) active = true;
      });
      apply();
      if (active && mode.current === "fall") raf.current = requestAnimationFrame(loop);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  }

  function returnHome() {
    mode.current = "return";
    const loop = () => {
      let active = false;
      phys.current.forEach((p) => {
        p.vx = 0; p.vy = 0;
        p.dx += (0 - p.dx) * 0.18;
        p.dy += (0 - p.dy) * 0.18;
        if (Math.abs(p.dx) > 0.3 || Math.abs(p.dy) > 0.3) active = true;
        else { p.dx = 0; p.dy = 0; }
      });
      apply();
      if (active && mode.current === "return") raf.current = requestAnimationFrame(loop);
      else mode.current = "idle";
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  }

  const handlers =
    reduced
      ? {}
      : trigger === "hover"
        ? { onPointerEnter: fall, onPointerLeave: () => reset && returnHome() }
        : trigger === "click"
          ? { onClick: () => (mode.current === "fall" ? reset && returnHome() : fall()) }
          : {};

  return (
    <Tag
      ref={containerRef as React.Ref<HTMLElement>}
      className={cn("relative inline-block", className)}
      aria-label={text}
      style={box ? { width: box.w, height: box.h } : undefined}
      {...handlers}
    >
      {chars.map((ch, i) => {
        const o = box ? origins.current[i] : null;
        return (
          <span
            key={i}
            aria-hidden
            ref={(el) => {
              charRefs.current[i] = el;
            }}
            className={cn("will-change-transform", box && "absolute")}
            style={o ? { left: o.x, top: o.y } : undefined}
          >
            {ch === " " ? " " : ch}
          </span>
        );
      })}
    </Tag>
  );
}
