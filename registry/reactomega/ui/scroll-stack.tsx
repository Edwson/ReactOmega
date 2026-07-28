"use client";

import { Children, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ScrollStackProps {
  children: React.ReactNode;
  /** Extra classes for the stack container. @default undefined */
  className?: string;
  /** Distance from the top of the viewport that each card pins at, in px. @default 80 */
  offset?: number;
  /** Scale removed per card resting on top of this one. @default 0.04 */
  scaleStep?: number;
  /** Opacity removed per card resting on top of this one. @default 0.14 */
  opacityStep?: number;
  /** Blur added per card resting on top of this one, in px. 0 disables the filter entirely. @default 2 */
  blur?: number;
  /** Vertical space between cards while they are still in flow, in px. @default 64 */
  gap?: number;
}

/** Cards deeper than this stop receding, so a long list can never invert the scale. */
const MAX_DEPTH = 4;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * ScrollStack — cards that collect into a deck as you scroll. Every card is pinned
 * with native `position: sticky` (never JS-driven fixed positioning, so it survives
 * iOS momentum scrolling), and each one recedes by the number of cards already
 * resting on top of it.
 *
 * The depth of a card is the running sum of how far every later card has travelled
 * to its rest position, measured live from the sticky wrappers' own rects — so it is
 * fractional and continuous rather than stepped. A receding card scales from its top
 * edge and lifts by exactly the height it loses (`height * depth * scaleStep`), which
 * pushes its top edge above the card in front by that same amount and produces the
 * fanned deck without any magic peek constant. The last card has nothing on top of it,
 * so it always renders clean.
 *
 * The transform lives on an inner element and the rect is read from the sticky wrapper,
 * so the measurement can never be contaminated by the transform it produces. Reads for
 * every card happen in one pass before any write, and scroll events only raise a dirty
 * flag that is drained on the next animation frame.
 *
 * Give each child an opaque background — they overlap by design. Reduced-motion users
 * get the same cards unpinned, unscaled and in normal document flow.
 */
export function ScrollStack({
  children,
  className,
  offset = 80,
  scaleStep = 0.04,
  opacityStep = 0.14,
  blur = 2,
  gap = 64,
}: ScrollStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const items = Children.toArray(children);

  useEffect(() => {
    const inners = innerRefs.current;
    const reset = () => {
      inners.forEach((el) => {
        if (!el) return;
        el.style.transform = "";
        el.style.opacity = "";
        el.style.filter = "";
      });
    };

    if (reduced) {
      reset();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const wraps = wrapRefs.current;
      const n = wraps.length;
      if (!n) return;

      // Read pass — every rect first, so no write can force an extra layout.
      const rects: (DOMRect | null)[] = new Array(n);
      for (let i = 0; i < n; i++) {
        const w = wraps[i];
        rects[i] = w ? w.getBoundingClientRect() : null;
      }

      // How far each card has travelled from "sitting below its predecessor" to
      // "landed on the stack". 0 when its top is one gap below the previous card's
      // bottom, 1 when the two tops coincide at the pin line.
      const arrival: number[] = new Array(n).fill(0);
      for (let j = 1; j < n; j++) {
        const prev = rects[j - 1];
        const cur = rects[j];
        if (!prev || !cur) continue;
        const travel = prev.height + gap;
        if (travel <= 0) continue;
        arrival[j] = clamp01((prev.bottom + gap - cur.top) / travel);
      }

      // Write pass — depth of card i is the sum of every arrival after it.
      let acc = 0;
      for (let i = n - 1; i >= 0; i--) {
        const inner = inners[i];
        const rect = rects[i];
        const depth = acc < MAX_DEPTH ? acc : MAX_DEPTH;
        acc += arrival[i];
        if (!inner) continue;

        if (depth < 0.001) {
          inner.style.transform = "";
          inner.style.opacity = "";
          if (blur > 0) inner.style.filter = "";
          continue;
        }

        const scale = 1 - depth * scaleStep;
        const lift = depth * (rect ? rect.height : 0) * scaleStep;
        inner.style.transform = `translate3d(0, ${(-lift).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        inner.style.opacity = Math.max(0, 1 - depth * opacityStep).toFixed(3);
        if (blur > 0) inner.style.filter = `blur(${(depth * blur).toFixed(2)}px)`;
      }
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    const ro = new ResizeObserver(request);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      ro.disconnect();
      reset();
    };
  }, [reduced, offset, scaleStep, opacityStep, blur, gap, items.length]);

  return (
    <div ref={containerRef} className={cn("flex flex-col", className)} style={{ gap: `${gap}px` }}>
      {items.map((child, i) => (
        <div
          key={i}
          ref={(el) => {
            wrapRefs.current[i] = el;
          }}
          className={reduced ? "relative" : "sticky"}
          style={reduced ? undefined : { top: `${offset}px` }}
        >
          <div
            ref={(el) => {
              innerRefs.current[i] = el;
            }}
            className={cn("origin-top", !reduced && "will-change-transform")}
          >
            {child}
          </div>
        </div>
      ))}
    </div>
  );
}
