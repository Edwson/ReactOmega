"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface CountUpProps {
  /** Target value. */
  to: number;
  /** Starting value. @default 0 */
  from?: number;
  /** Seconds the roll takes. @default 2 */
  duration?: number;
  /** Decimal places. @default 0 */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Group thousands (1,234). @default true */
  separator?: boolean;
  className?: string;
  /** Start when scrolled into view. @default true */
  startOnView?: boolean;
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

function format(n: number, decimals: number, separator: boolean) {
  const fixed = n.toFixed(decimals);
  if (!separator) return fixed;
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${grouped}.${dec}` : grouped;
}

/**
 * CountUp — rolls a number from `from` to `to` with an ease-out, optionally
 * triggered when it scrolls into view. Reduced-motion users get the final
 * value immediately. Uses tabular-nums to avoid width jitter.
 */
export function CountUp({
  to,
  from = 0,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = true,
  className,
  startOnView = true,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(from);
  const [armed, setArmed] = useState(!startOnView);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (armed) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return;
    }
    const onScreen = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      return r.bottom > 0 && r.top < vh;
    };
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setArmed(true);
            io.disconnect();
          }
        }),
      { threshold: 0.3 },
    );
    io.observe(el);
    // Fallback: after first layout, start if already on screen — robust to
    // lazy-mount wrappers and StrictMode, where the observer's first callback
    // can be dropped, leaving the number stuck at its start value.
    const raf = requestAnimationFrame(() => {
      if (onScreen()) setArmed(true);
    });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [armed]);

  useEffect(() => {
    if (!armed) return;
    if (reduced) {
      setVal(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      // Clamp to [0,1]: the first rAF timestamp can predate t0, and a negative
      // p makes easeOutExpo blow up (flashing a wild negative value).
      const p = Math.max(0, Math.min(1, (now - t0) / (duration * 1000)));
      setVal(from + (to - from) * easeOutExpo(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [armed, to, from, duration, reduced]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {format(val, decimals, separator)}
      {suffix}
    </span>
  );
}
