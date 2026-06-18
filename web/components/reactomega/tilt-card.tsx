"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum tilt in degrees. @default 12 */
  max?: number;
  /** Show a moving glare highlight. @default true */
  glare?: boolean;
  /** Scale while hovered. @default 1.02 */
  scale?: number;
}

/**
 * TiltCard — a 3D card that tilts toward the pointer with an optional glare.
 * Reduced-motion users get a flat, static card (no tilt, no glare).
 */
export function TiltCard({
  children,
  className,
  max = 12,
  glare = true,
  scale = 1.02,
  ...props
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
  const reduced = usePrefersReducedMotion();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setT({ rx: (0.5 - py) * 2 * max, ry: (px - 0.5) * 2 * max, gx: px * 100, gy: py * 100, active: true });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setT((s) => ({ ...s, rx: 0, ry: 0, active: false }))}
      className={cn("relative rounded-2xl border border-white/10 bg-neutral-950", className)}
      style={{
        transform: `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.active ? scale : 1})`,
        transition: "transform .25s cubic-bezier(.2,.7,.3,1)",
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      {children}
      {glare && !reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: t.active ? 1 : 0,
            background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,.18), transparent 45%)`,
          }}
        />
      )}
    </div>
  );
}
