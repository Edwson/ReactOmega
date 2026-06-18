"use client";

import { Children, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface DockProps {
  children: React.ReactNode;
  className?: string;
  /** Resting item size in px. @default 48 */
  size?: number;
  /** Maximum magnified size in px. @default 80 */
  magnify?: number;
  /** Pointer influence distance in px. @default 120 */
  distance?: number;
}

/**
 * Dock — a macOS-style magnifying dock. Items swell based on pointer distance.
 * Renders as a `toolbar`; reduced-motion users get a plain, fixed-size row.
 */
export function Dock({ children, className, size = 48, magnify = 80, distance = 120 }: DockProps) {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();
  const items = Children.toArray(children);

  return (
    <div
      role="toolbar"
      aria-label="Dock"
      onMouseMove={(e) => !reduced && setMouseX(e.clientX)}
      onMouseLeave={() => setMouseX(null)}
      className={cn(
        "mx-auto flex w-max items-end gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 pb-2 pt-3 backdrop-blur",
        className,
      )}
    >
      {items.map((child, i) => (
        <DockItem key={i} mouseX={mouseX} size={size} magnify={magnify} distance={distance}>
          {child}
        </DockItem>
      ))}
    </div>
  );
}

function DockItem({
  children,
  mouseX,
  size,
  magnify,
  distance,
}: {
  children: React.ReactNode;
  mouseX: number | null;
  size: number;
  magnify: number;
  distance: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  let dimension = size;
  if (mouseX !== null && ref.current) {
    const r = ref.current.getBoundingClientRect();
    const center = r.left + r.width / 2;
    const t = Math.max(0, 1 - Math.abs(mouseX - center) / distance);
    dimension = size + (magnify - size) * t;
  }
  return (
    <div
      ref={ref}
      className="grid place-items-center transition-[width,height] duration-150 ease-out"
      style={{ width: dimension, height: dimension }}
    >
      {children}
    </div>
  );
}
