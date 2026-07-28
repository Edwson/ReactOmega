"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface CardSwapProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  /** Cards to stack. Each child becomes one card face. */
  children: React.ReactNode;
  /** Extra classes for the deck container. @default undefined */
  className?: string;
  /** ms the front card holds before the deck advances. @default 3400 */
  interval?: number;
  /** Floor height of the stage in px — the deck needs room for its depth. @default 280 */
  minHeight?: number;
  /** px each card behind the front is nudged right (and up). @default 26 */
  offset?: number;
  /** px of Z distance between neighbouring cards. @default 62 */
  depth?: number;
  /** Degrees of Y-rotation added per card of depth. @default 5 */
  rotation?: number;
  /** Advance the deck on a timer. @default true */
  autoplay?: boolean;
  /** Called with the new front-card index whenever the deck moves. @default undefined */
  onChange?: (index: number) => void;
}

/** How many cards behind the front stay visible (and get reserved space). */
const VISIBLE_LAYERS = 3;
/** ms the outgoing card spends flying forward before the deck re-indexes. */
const PEEL_MS = 260;
/** ms every card takes to glide to its new slot. */
const SETTLE_MS = 520;

/**
 * CardSwap — a 3D deck where cards recede into the distance and the front one
 * peels away to reveal the next. Every card sits in the same absolutely
 * positioned stage under a shared `perspective`; its slot is derived purely
 * from `d`, its distance from the front, as
 * `translate3d(d·offset, -d·offset·0.55, -d·depth) rotateY(d·rotation)`, so the
 * whole deck is one pure function of the active index and CSS transitions do
 * the interpolation. Advancing runs in two phases: the outgoing card is thrown
 * forward on the top z-layer for `PEEL_MS`, then the index advances and it
 * drops to the back z-layer and slides home behind the stack. The stage is
 * inset by the total stack offset so cards never clip out of the container,
 * whatever children you pass.
 *
 * Accessibility: every card is a real `<button>` — clicking the front one deals
 * it away, clicking a buried one brings it forward. The deck is a roving
 * tabindex group (only the front card is tabbable) with Arrow/Home/End
 * navigation, and a polite live region announces the position on every change.
 * Autoplay pauses on hover and on focus-within so it can never yank a card out
 * from under a keyboard user. Reduced motion removes the peel, the timer and
 * every transition — cards cut instantly and the deck stays fully operable.
 */
export function CardSwap({
  children,
  className,
  interval = 3400,
  minHeight = 280,
  offset = 26,
  depth = 62,
  rotation = 5,
  autoplay = true,
  onChange,
  "aria-label": ariaLabel = "Card deck",
  style,
  ...rest
}: CardSwapProps) {
  const cards = Children.toArray(children);
  const n = cards.length;
  const [active, setActive] = useState(0);
  const [peel, setPeel] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();

  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const peelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wantFocus = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Report the front card without making the timer effect depend on the callback.
  // Comparing against the previous value keeps this correct under StrictMode's
  // double-invoked effects, where a plain "skip the first run" flag misfires.
  const reported = useRef(active);
  useEffect(() => {
    if (reported.current === active) return;
    reported.current = active;
    onChangeRef.current?.(active);
  }, [active]);

  // Move focus with the deck, but only when the change came from the keyboard.
  useEffect(() => {
    if (!wantFocus.current) return;
    wantFocus.current = false;
    btnRefs.current[active]?.focus();
  }, [active]);

  useEffect(() => () => {
    if (peelTimer.current) clearTimeout(peelTimer.current);
  }, []);

  const advance = useCallback(() => {
    if (n < 2 || peelTimer.current) return;
    if (reduced) {
      setActive((i) => (i + 1) % n);
      return;
    }
    setPeel(active);
    peelTimer.current = setTimeout(() => {
      peelTimer.current = null;
      setPeel(null);
      setActive((j) => (j + 1) % n);
    }, PEEL_MS);
  }, [n, reduced, active]);

  const goTo = useCallback(
    (i: number, fromKeyboard = false) => {
      if (n < 1) return;
      if (peelTimer.current) {
        clearTimeout(peelTimer.current);
        peelTimer.current = null;
        setPeel(null);
      }
      wantFocus.current = fromKeyboard;
      setActive(((i % n) + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (!autoplay || reduced || paused || n < 2) return;
    const t = setTimeout(advance, Math.max(600, interval));
    return () => clearTimeout(t);
  }, [autoplay, reduced, paused, n, interval, active, advance]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (n < 2) return;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        goTo(active + 1, true);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        goTo(active - 1, true);
        break;
      case "Home":
        e.preventDefault();
        goTo(0, true);
        break;
      case "End":
        e.preventDefault();
        goTo(n - 1, true);
        break;
      default:
        break;
    }
  };

  const layers = Math.max(0, Math.min(n - 1, VISIBLE_LAYERS));
  const padX = offset * layers;
  const padY = offset * 0.55 * layers;

  return (
    <div
      {...rest}
      role="group"
      aria-label={ariaLabel}
      aria-roledescription="card deck"
      onKeyDown={onKeyDown}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        // focusout bubbles between cards — only unpause when focus truly leaves.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      className={cn("relative isolate w-full", className)}
      style={{ perspective: 1200, minHeight, ...style }}
    >
      <div
        className="absolute bottom-0 left-0"
        style={{ right: padX, top: padY, transformStyle: "preserve-3d" }}
      >
        {cards.map((card, i) => {
          const d = n ? (i - active + n) % n : 0;
          const isPeeling = peel === i;
          const buried = d > layers;
          const transform = isPeeling
            ? `translate3d(${offset * 4.2}px, ${offset * 2.4}px, ${depth * 1.5}px) rotateY(${-rotation * 4}deg)`
            : `translate3d(${d * offset}px, ${-d * offset * 0.55}px, ${-d * depth}px) rotateY(${d * rotation}deg)`;
          return (
            <button
              key={i}
              type="button"
              ref={(el) => {
                btnRefs.current[i] = el;
              }}
              tabIndex={d === 0 ? 0 : -1}
              aria-current={d === 0 ? "true" : undefined}
              onClick={() => (d === 0 ? advance() : goTo(i))}
              className={cn(
                "absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left",
                "backdrop-blur outline-none will-change-transform",
                "focus-visible:ring-2 focus-visible:ring-[#7c5cff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]",
              )}
              style={{
                transform,
                transformOrigin: "center bottom",
                opacity: isPeeling ? 0 : buried ? 0 : 1 - d * 0.13,
                pointerEvents: buried || isPeeling ? "none" : "auto",
                zIndex: isPeeling ? n + 1 : n - d,
                boxShadow: d === 0 ? "0 24px 60px -24px rgba(0,0,0,.9)" : "0 12px 34px -20px rgba(0,0,0,.8)",
                transition: reduced
                  ? "none"
                  : `transform ${isPeeling ? PEEL_MS : SETTLE_MS}ms cubic-bezier(.2,.7,.3,1), opacity ${
                      isPeeling ? PEEL_MS : SETTLE_MS
                    }ms ease`,
              }}
            >
              {card}
            </button>
          );
        })}
      </div>
      <div aria-live="polite" role="status" className="sr-only">
        {n ? `Card ${active + 1} of ${n}` : "Empty deck"}
      </div>
    </div>
  );
}
