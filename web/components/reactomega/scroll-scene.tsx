"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ScrollSceneProps {
  /** Render prop. Receives the scrub progress: 0 the moment the scene pins, 1 when it unpins. */
  children: (progress: number) => React.ReactNode;
  /** Extra classes for the pinned viewport — the visible surface, not the tall outer spacer. @default undefined */
  className?: string;
  /** Extra viewports of scroll to pin for. 1 means one full screen of scrubbing. @default 1.5 */
  length?: number;
  /** Progress handed to children when the user prefers reduced motion. @default 1 */
  staticProgress?: number;
  /** Inertia on the scrub, 0 to 1. 0 tracks scroll exactly; higher glides in behind it. @default 0.72 */
  smoothing?: number;
  /** Called every frame with the raw, unrounded progress. The zero-re-render escape hatch. @default undefined */
  onProgress?: (progress: number) => void;
}

/**
 * ScrollScene — pins a section for a set distance and hands its children the scrub
 * progress, so anything at all can be driven by scroll position.
 *
 * A tall outer spacer (`100vh * (1 + length)`) holds the scroll distance; inside it a
 * `position: sticky; top: 0` viewport does the pinning natively, which is smoother than
 * a JS-driven fixed element and does not fight iOS momentum scrolling. Progress is
 * `-outer.top / (outer.height - pinned.height)` — deriving the travel from the two
 * measured heights rather than assuming `innerHeight` is what keeps it exact, because the
 * pin genuinely ends when the sticky element's bottom meets the spacer's bottom, and mobile
 * `100vh` is not the visible viewport. Off-by-one-viewport is the classic bug here and this
 * form has no viewport constant in it at all.
 *
 * Three ways out, in increasing cost: the pinned element carries a live `--ro-progress`
 * custom property (free, pure CSS); `onProgress` fires with the raw value every frame (no
 * re-render); and the render prop re-renders, but only on a change of 1/1000, so a frame
 * that does not move the value does not cost a render. Smoothing is a frame-rate-independent
 * exponential (`1 - smoothing^(dt*60)`), and the loop stops itself once it has settled.
 *
 * Reduced motion removes the spacer and the pin entirely: the section takes its natural
 * height in normal flow and the children are rendered once at `staticProgress`, so nothing
 * is ever left off-screen or invisible. Keep focusable elements visible across the whole
 * range — a link that only exists at progress 0.5 is a keyboard trap.
 */
export function ScrollScene({
  children,
  className,
  length = 1.5,
  staticProgress = 1,
  smoothing = 0.72,
  onProgress,
}: ScrollSceneProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onProgress);
  const [progress, setProgress] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    callbackRef.current = onProgress;
  });

  useEffect(() => {
    if (!reduced) return;
    pinRef.current?.style.setProperty("--ro-progress", staticProgress.toFixed(5));
    callbackRef.current?.(staticProgress);
  }, [reduced, staticProgress]);

  useEffect(() => {
    if (reduced) return;
    const outer = outerRef.current;
    const pin = pinRef.current;
    if (!outer || !pin) return;

    const inertia = smoothing < 0 ? 0 : smoothing > 0.99 ? 0.99 : smoothing;
    let raf = 0;
    let running = false;
    let dirty = false;
    let primed = false;
    let last = 0;
    let current = 0;
    let target = 0;

    const measure = () => {
      const outerRect = outer.getBoundingClientRect();
      const travel = outerRect.height - pin.getBoundingClientRect().height;
      if (travel <= 0) {
        target = outerRect.top <= 0 ? 1 : 0;
        return;
      }
      const p = -outerRect.top / travel;
      target = p < 0 ? 0 : p > 1 ? 1 : p;
    };

    const commit = (value: number) => {
      pin.style.setProperty("--ro-progress", value.toFixed(5));
      callbackRef.current?.(value);
      const quantised = Math.round(value * 1000) / 1000;
      setProgress((prev) => (prev === quantised ? prev : quantised));
    };

    const step = (now: number) => {
      // Layout reads happen here, never in the scroll handler.
      if (dirty) {
        dirty = false;
        measure();
      }
      const dt = primed ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      primed = true;

      const k = inertia > 0 ? 1 - Math.pow(inertia, dt * 60) : 1;
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0002) current = target;
      commit(current);

      if (current !== target || dirty) {
        raf = requestAnimationFrame(step);
      } else {
        running = false;
        raf = 0;
      }
    };

    const ensure = () => {
      if (running) return;
      running = true;
      primed = false;
      raf = requestAnimationFrame(step);
    };

    const invalidate = () => {
      dirty = true;
      ensure();
    };

    measure();
    current = target;
    commit(current);

    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    const ro = new ResizeObserver(invalidate);
    ro.observe(outer);
    ro.observe(pin);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      ro.disconnect();
    };
  }, [reduced, smoothing]);

  const value = reduced ? staticProgress : progress;

  return (
    <div
      ref={outerRef}
      className={reduced ? undefined : "ro-scene"}
      style={reduced ? undefined : ({ "--ro-scene-len": String(1 + Math.max(0, length)) } as React.CSSProperties)}
    >
      <div
        ref={pinRef}
        className={cn(reduced ? "relative" : "ro-scene-pin sticky top-0 overflow-hidden", className)}
      >
        {children(value)}
      </div>
      {!reduced && (
        <style>{`.ro-scene{height:calc(100vh * var(--ro-scene-len,2.5))}.ro-scene-pin{height:100vh}@supports (height:100svh){.ro-scene{height:calc(100svh * var(--ro-scene-len,2.5))}.ro-scene-pin{height:100svh}}`}</style>
      )}
    </div>
  );
}
