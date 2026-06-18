"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface HolographicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max 3D tilt in degrees. @default 10 */
  tilt?: number;
  /** Holographic foil strength, 0..1. @default 0.45 */
  intensity?: number;
  /** Rainbow stops of the foil. */
  colors?: string[];
}

const DEFAULT_FOIL = ["#ff0080", "#ffce00", "#00ff8a", "#00b3ff", "#c800ff", "#ff0080"];

/**
 * HolographicCard — an iridescent "holo foil" card. A rainbow sheen and a bright
 * glare track the pointer and shift with a color-dodge blend, over a subtle 3D
 * tilt — like a holographic trading card. Calm and flat for reduced-motion users.
 */
export function HolographicCard({
  children,
  className,
  tilt = 10,
  intensity = 0.45,
  colors = DEFAULT_FOIL,
  ...props
}: HolographicCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 0.5, y: 0.5, active: false });
  const reduced = usePrefersReducedMotion();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setP({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, active: true });
  };

  const rx = reduced ? 0 : (0.5 - p.y) * 2 * tilt;
  const ry = reduced ? 0 : (p.x - 0.5) * 2 * tilt;
  const foil = `linear-gradient(${115 + p.x * 50}deg, ${colors.join(", ")})`;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setP((s) => ({ ...s, active: false }))}
      className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950", className)}
      style={{
        transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`,
        transition: "transform .25s cubic-bezier(.2,.7,.3,1)",
      }}
      {...props}
    >
      {/* holographic foil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: (reduced ? 0.25 : p.active ? 1 : 0.2) * intensity,
          backgroundImage: foil,
          backgroundSize: "300% 300%",
          backgroundPosition: `${p.x * 100}% ${p.y * 100}%`,
          mixBlendMode: "color-dodge",
        }}
      />
      {/* moving glare */}
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: p.active ? 1 : 0,
            background: `radial-gradient(circle at ${p.x * 100}% ${p.y * 100}%, rgba(255,255,255,.35), transparent 45%)`,
            mixBlendMode: "overlay",
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
