"use client";

import { cn } from "@/lib/utils";

export interface StarBorderProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render as. @default "button" */
  as?: React.ElementType;
  /** Orbiting light color. @default "#7c5cff" */
  color?: string;
  /** Seconds per full orbit. @default 4 */
  speed?: number;
  /** Border thickness in px. @default 2 */
  thickness?: number;
  /** Inner panel background. @default "#0a0a0f" */
  background?: string;
}

/**
 * StarBorder — two bright light arcs orbit the edge of any element via a
 * rotating conic gradient, leaving a clear comet-trail around the border.
 * Pure CSS. Reduced-motion users get a calm static gradient edge.
 */
export function StarBorder({
  as: Tag = "button",
  color = "#7c5cff",
  speed = 4,
  thickness = 2,
  background = "#0a0a0f",
  className,
  children,
  style,
  ...props
}: StarBorderProps) {
  const ring = `conic-gradient(from 0deg, transparent 0deg, ${color} 45deg, #ffffff 70deg, ${color} 95deg, transparent 150deg, transparent 225deg, ${color} 270deg, #ffffff 290deg, ${color} 315deg, transparent 360deg)`;
  return (
    <Tag
      className={cn(
        "ro-star relative isolate inline-flex items-center justify-center overflow-hidden rounded-2xl",
        className,
      )}
      style={{ padding: thickness, ...style }}
      {...props}
    >
      <span
        aria-hidden
        className="ro-star-ring absolute left-1/2 top-1/2 -z-10 aspect-square w-[160%]"
        style={{ background: ring, animationDuration: `${speed}s` }}
      />
      <span
        className="relative z-10 block w-full rounded-[14px] px-6 py-3 text-center font-medium text-white"
        style={{ background }}
      >
        {children}
      </span>
      <style>{`.ro-star-ring{transform:translate(-50%,-50%);animation:ro-star-spin linear infinite}@keyframes ro-star-spin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}@media(prefers-reduced-motion:reduce){.ro-star-ring{animation:none!important;background:linear-gradient(120deg,${color},transparent 70%)!important}}`}</style>
    </Tag>
  );
}
