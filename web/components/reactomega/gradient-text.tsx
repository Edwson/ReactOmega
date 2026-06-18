"use client";

import { cn } from "@/lib/utils";

export interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  /** Gradient stop colors (looped). @default indigo → violet → pink → indigo */
  colors?: string[];
  /** Seconds per loop. @default 6 */
  speed?: number;
}

/**
 * GradientText — an animated multi-stop gradient flows through the text.
 * Pure CSS, no dependencies. Honors reduced-motion automatically.
 */
export function GradientText({
  children,
  className,
  colors = ["#6366f1", "#a855f7", "#ec4899", "#6366f1"],
  speed = 6,
}: GradientTextProps) {
  return (
    <span
      className={cn("ro-grad inline-block bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
        backgroundSize: "300% 100%",
        WebkitBackgroundClip: "text",
        animation: `ro-grad ${speed}s linear infinite`,
      }}
    >
      {children}
      <style>{`@keyframes ro-grad{to{background-position:300% 0}}@media(prefers-reduced-motion:reduce){.ro-grad{animation:none!important}}`}</style>
    </span>
  );
}
