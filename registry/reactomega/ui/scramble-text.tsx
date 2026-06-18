"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ScrambleTextProps {
  text: string;
  /** What starts the decode. @default "view" */
  trigger?: "hover" | "view" | "load";
  /** Glyphs cycled before a letter locks in. */
  charset?: string;
  /** Milliseconds per scramble frame. @default 40 */
  speed?: number;
  /** Extra ms before each successive character locks (the wipe). @default 60 */
  revealDelay?: number;
  /** Re-run on every hover (trigger="hover"). @default true */
  loop?: boolean;
  className?: string;
  /** Element to render as. @default "span" */
  as?: ElementType;
}

const DEFAULT_CHARSET = "!<>-_\\/[]{}—=+*^?#abcdef0123456789";

/**
 * ScrambleText — letters churn through random glyphs and lock in left-to-right,
 * like a decoding terminal. Configure the charset, speed, reveal wipe, and what
 * triggers it. Reduced-motion users see the final text immediately.
 */
export function ScrambleText({
  text,
  trigger = "view",
  charset = DEFAULT_CHARSET,
  speed = 40,
  revealDelay = 60,
  loop = true,
  className,
  as: Tag = "span",
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const ref = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduced = usePrefersReducedMotion();

  const run = () => {
    if (reduced) { setDisplay(text); return; }
    if (timer.current) clearInterval(timer.current);
    const chars = Array.from(text);
    let elapsed = 0;
    const lockAt = chars.map((_, i) => i * revealDelay);
    const maxLock = lockAt[lockAt.length - 1] ?? 0;
    timer.current = setInterval(() => {
      elapsed += speed;
      setDisplay(
        chars
          .map((c, i) => {
            if (c === " " || elapsed >= lockAt[i] + speed) return c;
            return charset[(Math.random() * charset.length) | 0];
          })
          .join(""),
      );
      if (elapsed >= maxLock + speed) {
        clearInterval(timer.current!);
        timer.current = null;
        setDisplay(text);
      }
    }, speed);
  };

  useEffect(() => {
    if (reduced) { setDisplay(text); return; }
    if (trigger === "load") { run(); return () => { if (timer.current) clearInterval(timer.current); }; }
    if (trigger === "view") {
      const el = ref.current;
      if (!el || typeof IntersectionObserver === "undefined") { run(); return; }
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { run(); io.disconnect(); } }),
        { threshold: 0.4 },
      );
      io.observe(el);
      return () => { io.disconnect(); if (timer.current) clearInterval(timer.current); };
    }
    return () => { if (timer.current) clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, trigger, reduced]);

  const hoverProps = trigger === "hover" && !reduced ? { onPointerEnter: () => (loop || display !== text) && run() } : {};

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={cn("inline-block tabular-nums", className)} aria-label={text} {...hoverProps}>
      <span aria-hidden>{display}</span>
    </Tag>
  );
}
