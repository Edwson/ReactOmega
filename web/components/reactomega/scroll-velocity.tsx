"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ScrollVelocityProps {
  children: React.ReactNode;
  /** Extra classes for the clipping row. @default undefined */
  className?: string;
  /** Baseline drift in px per second, running even when the page is still. @default 40 */
  baseSpeed?: number;
  /** Fraction of the scroll velocity (px/s) added to the drift. @default 0.75 */
  velocityFactor?: number;
  /** Degrees of skew per 1000 px/s of scroll velocity. @default 5 */
  skew?: number;
  /** Hard cap on the skew, in degrees. @default 12 */
  maxSkew?: number;
  /** Direction of the baseline drift. @default "left" */
  direction?: "left" | "right";
}

/** Space between repeats, in px. Also the seam gap, so the loop period is width + this. */
const SEAM = 32;
/** Scroll velocity is clamped here (px/s) so a flick or a scroll-to-top cannot slingshot the row. */
const MAX_VELOCITY = 2600;

/**
 * ScrollVelocity — a row of repeated content that always drifts at a baseline speed but
 * is shoved along by how fast you are scrolling, skewing into the lurch and easing back
 * to its baseline when you stop.
 *
 * Velocity is the change in `scrollY` divided by the real frame delta, then smoothed with
 * a time-constant exponential filter (`1 - e^(-dt/tau)`) rather than a fixed per-frame
 * lerp, so the feel is identical at 60Hz and 120Hz. It is clamped before use, which is
 * what stops a scroll-to-top or a trackpad flick from launching the row across the screen.
 * The smoothing is what makes it *ease* back rather than snap: when scrolling stops the
 * instantaneous velocity is 0 and the filter decays into it.
 *
 * The loop is seamless in the marquee way — the track is duplicated and the offset is
 * wrapped with a modulo of one repeat's period (measured width plus the seam gap, taken
 * from a ResizeObserver so the transform on the row can never contaminate it). Because the
 * offset is normalised into [0, period) every frame, scroll velocity may reverse the row
 * past its baseline direction without ever exposing an edge.
 *
 * The animation frame only runs while the row is on screen, and reduced-motion users get a
 * single static, wrapped copy — all content readable, nothing clipped or in motion.
 */
export function ScrollVelocity({
  children,
  className,
  baseSpeed = 40,
  velocityFactor = 0.75,
  skew = 5,
  maxSkew = 12,
  direction = "left",
}: ScrollVelocityProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const row = rowRef.current;
    const copy = copyRef.current;
    if (!root || !row || !copy) return;

    const dir = direction === "right" ? -1 : 1;
    let period = 0;
    let x = 0;
    let velocity = 0;
    let last = 0;
    let lastY = window.scrollY;
    let raf = 0;

    const step = (now: number) => {
      // Clamped so a background tab or a long frame cannot teleport the row.
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;

      const y = window.scrollY;
      const instant = dt > 0 ? (y - lastY) / dt : 0;
      lastY = y;

      const k = 1 - Math.exp(-dt / 0.09);
      velocity += (instant - velocity) * k;
      if (velocity > MAX_VELOCITY) velocity = MAX_VELOCITY;
      else if (velocity < -MAX_VELOCITY) velocity = -MAX_VELOCITY;

      x += (baseSpeed * dir + velocity * velocityFactor) * dt;
      if (period > 0) x = ((x % period) + period) % period;

      let deg = (velocity / 1000) * skew;
      if (deg > maxSkew) deg = maxSkew;
      else if (deg < -maxSkew) deg = -maxSkew;

      row.style.transform = `translate3d(${(-x).toFixed(2)}px, 0, 0) skewX(${deg.toFixed(2)}deg)`;
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (raf) return;
      // Re-prime the clock and the scroll anchor, otherwise resuming produces one
      // enormous fake velocity spike from everything that happened while paused.
      last = 0;
      lastY = window.scrollY;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver((entries) => {
      period = entries[0].contentRect.width + SEAM;
    });
    ro.observe(copy);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) start();
        else stop();
      },
      { rootMargin: "160px 0px" },
    );
    io.observe(root);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      row.style.transform = "";
    };
  }, [reduced, baseSpeed, velocityFactor, skew, maxSkew, direction]);

  if (reduced) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex flex-wrap items-center" style={{ gap: `${SEAM}px` }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("w-full overflow-hidden", className)}>
      <div
        ref={rowRef}
        className="flex w-max will-change-transform"
        style={{ gap: `${SEAM}px` }}
      >
        {[0, 1].map((k) => (
          <div
            key={k}
            ref={k === 0 ? copyRef : undefined}
            aria-hidden={k === 1}
            className="flex w-max shrink-0 items-center whitespace-nowrap"
            style={{ gap: `${SEAM}px` }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
