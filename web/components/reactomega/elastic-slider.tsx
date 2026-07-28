"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ElasticSliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "children"> {
  /** Extra classes for the row that holds the icons and the track. @default undefined */
  className?: string;
  /** Controlled value. @default undefined */
  value?: number;
  /** Uncontrolled starting value. @default 50 */
  defaultValue?: number;
  /** Lower bound. @default 0 */
  min?: number;
  /** Upper bound. @default 100 */
  max?: number;
  /** Quantisation step. @default 1 */
  step?: number;
  /** Fires with every committed value. @default undefined */
  onChange?: (value: number) => void;
  /** Maximum rubber-band overshoot in px at either end, 0 disables. @default 56 */
  elasticity?: number;
  /** Formats the value for the readout and `aria-valuetext`. @default (v) => String(v) */
  formatValue?: (value: number) => string;
  /** Node rendered before the track. @default undefined */
  leftIcon?: React.ReactNode;
  /** Node rendered after the track. @default undefined */
  rightIcon?: React.ReactNode;
}

/** Spring constants for the release snap-back. */
const SPRING_K = 0.24;
const SPRING_DAMP = 0.7;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * ElasticSlider — a slider whose track rubber-bands when you drag past either
 * end. Pointer travel beyond the rail is converted to overshoot through
 * `limit · (1 - e^(-excess / limit))`, an asymptotic curve: the first pixels
 * past the end move almost freely, the last ones barely move at all, and the
 * result can never exceed `elasticity` no matter how far you pull — the
 * diminishing-returns feel of a real elastic band, which a linear clamp cannot
 * produce. The overshoot becomes a `scaleX` on the whole track anchored to the
 * opposite end (so the rail genuinely stretches rather than translating), with
 * a reciprocal `scaleX` on the thumb to keep it circular. Releasing hands the
 * overshoot to a damped spring integrated in `requestAnimationFrame`; the rail
 * also swells on the Y axis while the pointer is down. All of that is written
 * straight to `style.transform` each frame, while the value itself stays
 * ordinary React state, and the rail width is re-read live so the maths
 * survives a resizing or scrolling page.
 *
 * Accessibility: the track carries the full `role="slider"` contract —
 * `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext` /
 * `aria-orientation` — and is focusable, with Arrow keys stepping,
 * PageUp/PageDown taking a larger jump, and Home/End going to the bounds.
 * Dragging uses Pointer Events with pointer capture and `touch-action: none`,
 * so it works identically with touch, pen and mouse. Reduced motion keeps every
 * one of those interactions and simply removes the stretch, the swell and the
 * spring.
 */
export function ElasticSlider({
  className,
  value,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  elasticity = 56,
  formatValue,
  leftIcon,
  rightIcon,
  "aria-label": ariaLabel = "Value",
  "aria-labelledby": ariaLabelledBy,
  style,
  ...rest
}: ElasticSliderProps) {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const stretchRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const over = useRef(0);
  const vel = useRef(0);
  const swell = useRef(0);
  const dragging = useRef(false);
  const raf = useRef(0);

  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  const span = max - min || 1;
  const decimals = (() => {
    const s = String(step);
    const dot = s.indexOf(".");
    return dot < 0 ? 0 : s.length - dot - 1;
  })();
  const quantize = useCallback(
    (v: number) => {
      const snapped = Math.round((v - min) / step) * step + min;
      return clamp(Number(snapped.toFixed(decimals)), min, max);
    },
    [min, max, step, decimals],
  );

  const safe = clamp(current, min, max);
  const pct = ((safe - min) / span) * 100;
  const readout = formatValue ? formatValue(safe) : String(safe);

  const commit = useCallback(
    (raw: number) => {
      const next = quantize(raw);
      if (value === undefined) setInternal(next);
      if (next !== safe) onChange?.(next);
    },
    [quantize, value, safe, onChange],
  );

  const paint = useCallback(() => {
    const track = trackRef.current;
    const stretch = stretchRef.current;
    const rail = railRef.current;
    const thumb = thumbRef.current;
    if (!track || !stretch || !rail || !thumb) return;
    // Live width every frame — a cached rect goes stale as the page reflows.
    const w = track.getBoundingClientRect().width || 1;
    const o = over.current;
    const s = 1 + Math.abs(o) / w;
    stretch.style.transformOrigin = o > 0 ? "left center" : "right center";
    stretch.style.transform = `scaleX(${s.toFixed(4)})`;
    rail.style.transform = `scaleY(${(1 + swell.current * 0.7).toFixed(3)})`;
    thumb.style.transform = `translate(-50%,-50%) scaleX(${(1 / s).toFixed(4)}) scale(${(1 + swell.current * 0.14).toFixed(3)})`;
  }, []);

  const tick = useCallback(() => {
    raf.current = 0;
    if (!dragging.current) {
      vel.current = (vel.current - over.current * SPRING_K) * SPRING_DAMP;
      over.current += vel.current;
      if (Math.abs(over.current) < 0.08 && Math.abs(vel.current) < 0.08) {
        over.current = 0;
        vel.current = 0;
      }
    }
    swell.current += ((dragging.current ? 1 : 0) - swell.current) * 0.22;
    if (swell.current < 0.004 && !dragging.current) swell.current = 0;
    paint();
    if (dragging.current || over.current !== 0 || swell.current !== 0) {
      raf.current = requestAnimationFrame(tick);
    }
  }, [paint]);

  const ensureLoop = useCallback(() => {
    if (reduced) return;
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  }, [reduced, tick]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Keep the rendered thumb geometry correct after value / size changes.
  useEffect(() => {
    if (reduced) return;
    if (!raf.current) paint();
  }, [safe, reduced, paint]);

  const fromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const r = track.getBoundingClientRect();
    const w = r.width || 1;
    const ratio = (clientX - r.left) / w;
    commit(min + clamp(ratio, 0, 1) * span);

    if (reduced || elasticity <= 0) {
      over.current = 0;
      return;
    }
    const excess = ratio < 0 ? -ratio * w : ratio > 1 ? (ratio - 1) * w : 0;
    const band = elasticity * (1 - Math.exp(-excess / elasticity));
    over.current = ratio < 0 ? -band : ratio > 1 ? band : 0;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.currentTarget.focus();
    dragging.current = true;
    vel.current = 0; // drop any momentum left over from a previous snap-back
    fromClientX(e.clientX);
    ensureLoop();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    fromClientX(e.clientX);
    ensureLoop();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    ensureLoop();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(step * 10, span / 10);
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = safe + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = safe - step;
        break;
      case "PageUp":
        next = safe + big;
        break;
      case "PageDown":
        next = safe - big;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    commit(clamp(next, min, max));
  };

  return (
    <div {...rest} className={cn("flex w-full items-center gap-3 select-none", className)} style={style}>
      {leftIcon != null && (
        <span aria-hidden className="shrink-0 text-white/50">
          {leftIcon}
        </span>
      )}

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-orientation="horizontal"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={safe}
        aria-valuetext={readout}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className={cn(
          "relative min-w-0 flex-1 cursor-pointer py-3 outline-none",
          "focus-visible:ring-2 focus-visible:ring-[#7c5cff] focus-visible:ring-offset-4 focus-visible:ring-offset-[#06060a] focus-visible:rounded-full",
        )}
        style={{ touchAction: "none" }}
      >
        <div ref={stretchRef} className="relative flex h-4 w-full items-center will-change-transform">
          <div ref={railRef} className="h-1.5 w-full rounded-full bg-white/10 will-change-transform">
            <div
              className="h-full rounded-full bg-[#7c5cff]"
              style={{ width: `${pct}%`, transition: reduced ? "none" : "width .12s linear" }}
            />
          </div>
          <div
            ref={thumbRef}
            aria-hidden
            className="absolute top-1/2 h-4 w-4 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,.6)] will-change-transform"
            style={{ left: `${pct}%`, transform: "translate(-50%,-50%)" }}
          />
        </div>
      </div>

      {rightIcon != null && (
        <span aria-hidden className="shrink-0 text-white/50">
          {rightIcon}
        </span>
      )}
      <span aria-hidden className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-white/70">
        {readout}
      </span>
    </div>
  );
}
