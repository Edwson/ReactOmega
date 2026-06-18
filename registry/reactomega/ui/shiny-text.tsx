"use client";

import { cn } from "@/lib/utils";

export interface ShinyTextProps {
  text: string;
  className?: string;
  /** Seconds for one sheen sweep. @default 3 */
  speed?: number;
  /** Base text color. @default "#9aa0ad" */
  color?: string;
  /** Highlight color of the sweep. @default "#ffffff" */
  shine?: string;
  /** Optional colored glint trailing the white peak. @default "#cbb8ff" */
  glint?: string;
  /** Pause the sweep. @default false */
  disabled?: boolean;
}

/**
 * ShinyText — a soft highlight sweeps across the text on a loop. Pure CSS,
 * no dependencies. Honors reduced-motion automatically.
 */
export function ShinyText({
  text,
  className,
  speed = 3,
  color = "#9aa0ad",
  shine = "#ffffff",
  glint = "#cbb8ff",
  disabled = false,
}: ShinyTextProps) {
  return (
    <span
      className={cn("ro-shiny inline-block bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: `linear-gradient(110deg, ${color} 30%, ${shine} 46%, ${shine} 50%, ${glint} 56%, ${color} 70%)`,
        backgroundSize: "220% 100%",
        WebkitBackgroundClip: "text",
        animation: disabled ? "none" : `ro-shine ${speed}s linear infinite`,
      }}
    >
      {text}
      <style>{`@keyframes ro-shine{to{background-position:-200% 0}}@media(prefers-reduced-motion:reduce){.ro-shiny{animation:none!important}}`}</style>
    </span>
  );
}
