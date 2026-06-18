"use client";

import { cn } from "@/lib/utils";

export interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds per loop. @default 20 */
  speed?: number;
  /** Reverse the direction. @default false */
  reverse?: boolean;
  /** Scroll vertically instead of horizontally. @default false */
  vertical?: boolean;
  /** Pause while hovered. @default true */
  pauseOnHover?: boolean;
  /** Fade the leading/trailing edges. @default true */
  fade?: boolean;
}

/**
 * Marquee — a seamless infinite scroller (horizontal or vertical) with edge
 * fade and pause-on-hover. Two duplicated tracks make the loop seamless.
 * Reduced-motion users get a static, non-scrolling row.
 */
export function Marquee({
  children,
  className,
  speed = 20,
  reverse = false,
  vertical = false,
  pauseOnHover = true,
  fade = true,
}: MarqueeProps) {
  const mask = vertical
    ? "linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)"
    : "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)";

  return (
    <div
      className={cn("ro-marquee group relative flex overflow-hidden", vertical ? "flex-col" : "flex-row", className)}
      style={fade ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    >
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1}
          className={cn(
            "ro-marquee-track flex shrink-0 items-center gap-4",
            vertical ? "flex-col" : "flex-row",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
          style={{
            animation: `${vertical ? "ro-marq-y" : "ro-marq-x"} ${speed}s linear infinite`,
            animationDirection: reverse ? "reverse" : "normal",
            paddingInlineEnd: vertical ? undefined : "1rem",
            paddingBlockEnd: vertical ? "1rem" : undefined,
          }}
        >
          {children}
        </div>
      ))}
      <style>{`@keyframes ro-marq-x{to{transform:translateX(-100%)}}@keyframes ro-marq-y{to{transform:translateY(-100%)}}@media(prefers-reduced-motion:reduce){.ro-marquee-track{animation:none!important}}`}</style>
    </div>
  );
}
