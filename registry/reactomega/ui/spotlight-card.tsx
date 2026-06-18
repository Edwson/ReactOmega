"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spotlight color. @default "rgba(124,92,255,.18)" */
  color?: string;
  /** Spotlight radius in px. @default 240 */
  radius?: number;
}

/**
 * SpotlightCard — a card with a soft radial spotlight that tracks the pointer
 * and fades in/out on enter/leave. The fade is removed for reduced-motion users
 * (the highlight appears instantly, with no easing).
 */
export function SpotlightCard({
  children,
  className,
  color = "rgba(124,92,255,.18)",
  radius = 240,
  ...props
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 0, y: 0 });
  const [on, setOn] = useState(false);
  const reduced = usePrefersReducedMotion();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setP({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 p-6", className)}
      {...props}
    >
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0", !reduced && "transition-opacity duration-300")}
        style={{
          opacity: on ? 1 : 0,
          background: `radial-gradient(${radius}px circle at ${p.x}px ${p.y}px, ${color}, transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
