"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ParallaxLayersProps {
  children: React.ReactNode;
  /** Extra classes for the section. @default undefined */
  className?: string;
  /** Drift of a `depth={1}` layer at the extremes of the pass, in px. @default 120 */
  range?: number;
  /** Axis the layers drift along. @default "y" */
  axis?: "y" | "x";
  /** Hold the drift at its extremes once the section has left the viewport. @default true */
  clamp?: boolean;
}

export interface ParallaxLayerProps {
  children: React.ReactNode;
  /** Extra classes for the layer. @default undefined */
  className?: string;
  /** 0 is locked to the page, 1 drifts the full `range`. Values above 1 are allowed. @default 0.3 */
  depth?: number;
  /** Extra scale at `depth={1}`, e.g. 0.08 to over-size drifting layers so no edge is exposed. @default 0 */
  scale?: number;
  /** Blur at `depth={1}`, in px, scaled by depth. 0 disables the filter entirely. @default 0 */
  blur?: number;
}

interface Registration {
  el: HTMLElement;
  depth: number;
  scale: number;
  blur: number;
}

const ParallaxContext = createContext<{ register: (r: Registration) => () => void } | null>(null);

/**
 * ParallaxLayers — a section whose children drift at different rates as it passes through
 * the viewport, so nearer things outrun farther ones and the band reads as having depth.
 *
 * Progress is signed and derived from the container's own position rather than raw
 * `scrollY`: `(viewportCentre - sectionCentre) / ((viewportHeight + sectionHeight) / 2)`.
 * That is exactly -1 when the section is about to enter, **0 when the section is centred**,
 * and +1 when it has just left — so the layers sit at their neutral, as-authored positions
 * at the moment the reader is actually looking at them, and the effect never depends on
 * where the section happens to live in the document.
 *
 * Layers register their DOM node with the container through context rather than receiving
 * progress as a prop, so the scroll loop writes `transform` straight to each node and the
 * React tree never re-renders while scrolling. The container reads one rect per frame,
 * coalesced from a passive scroll listener via a dirty animation frame, and re-measures
 * through a ResizeObserver.
 *
 * Reduced-motion users get every layer at its neutral position in normal flow — nothing is
 * displaced, blurred or scaled.
 */
export function ParallaxLayers({
  children,
  className,
  range = 120,
  axis = "y",
  clamp = true,
}: ParallaxLayersProps) {
  const ref = useRef<HTMLDivElement>(null);
  const registry = useRef<Set<Registration>>(new Set());
  const requestRef = useRef<() => void>(() => {});
  const reduced = usePrefersReducedMotion();

  const register = useCallback((entry: Registration) => {
    registry.current.add(entry);
    requestRef.current();
    return () => {
      registry.current.delete(entry);
      entry.el.style.transform = "";
      entry.el.style.filter = "";
    };
  }, []);

  const ctx = useMemo(() => ({ register }), [register]);

  useEffect(() => {
    const clear = () => {
      registry.current.forEach((entry) => {
        entry.el.style.transform = "";
        entry.el.style.filter = "";
      });
    };

    if (reduced) {
      clear();
      return;
    }

    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const span = (vh + rect.height) / 2;
      if (span <= 0) return;

      let p = (vh / 2 - (rect.top + rect.height / 2)) / span;
      if (clamp) p = p < -1 ? -1 : p > 1 ? 1 : p;

      registry.current.forEach((entry) => {
        const shift = p * range * entry.depth;
        const move =
          axis === "x"
            ? `translate3d(${shift.toFixed(2)}px, 0, 0)`
            : `translate3d(0, ${shift.toFixed(2)}px, 0)`;
        const s = 1 + entry.depth * entry.scale;
        entry.el.style.transform = entry.scale !== 0 ? `${move} scale(${s.toFixed(4)})` : move;
        if (entry.blur > 0) entry.el.style.filter = `blur(${(entry.depth * entry.blur).toFixed(2)}px)`;
      });
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    requestRef.current = request;
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    const ro = new ResizeObserver(request);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      requestRef.current = () => {};
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      ro.disconnect();
      clear();
    };
  }, [reduced, range, axis, clamp]);

  return (
    <ParallaxContext.Provider value={ctx}>
      <div ref={ref} className={cn("relative overflow-hidden", className)}>
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}

/**
 * ParallaxLayer — one plane inside a `ParallaxLayers` section. It registers its node with
 * the parent on mount and is driven imperatively from there, so changing `depth` re-registers
 * and takes effect on the next frame. Used outside a `ParallaxLayers` it renders as a plain
 * block with no motion, which is also exactly what reduced-motion users get.
 */
export function ParallaxLayer({ children, className, depth = 0.3, scale = 0, blur = 0 }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useContext(ParallaxContext);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ctx) return;
    return ctx.register({ el, depth, scale, blur });
  }, [ctx, depth, scale, blur]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
