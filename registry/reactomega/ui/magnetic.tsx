"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum px the element travels toward the pointer. @default 24 */
  strength?: number;
  /** Spring-back smoothing (CSS transition seconds). @default 0.3 */
  ease?: number;
}

/**
 * Magnetic — wraps any element so it drifts toward the pointer and springs
 * back on leave. Only engages for mouse input and never for reduced-motion
 * users, so it stays calm on touch and assistive setups.
 */
export function Magnetic({ children, className, strength = 24, ease = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const reduced = usePrefersReducedMotion();

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    const half = Math.max(r.width, r.height) / 2 || 1;
    const pull = Math.min(1, Math.hypot(mx, my) / (half * 2));
    setPos({ x: (mx / half) * strength * pull, y: (my / half) * strength * pull });
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => setPos({ x: 0, y: 0 })}
      className={cn("inline-block", className)}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        transition: `transform ${ease}s cubic-bezier(.2,.7,.3,1)`,
      }}
    >
      {children}
    </div>
  );
}
