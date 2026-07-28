"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface ImageTrailProps {
  /** Image sources dropped along the pointer path, cycled in order. */
  images: string[];
  /** Content rendered underneath the trail. */
  children?: React.ReactNode;
  className?: string;
  /** Size of the recycled image pool — the most that can be on screen at once. @default 8 */
  count?: number;
  /** Px the pointer must travel before the next image is dropped. @default 60 */
  threshold?: number;
  /** Lifetime of each image in ms. @default 750 */
  duration?: number;
  /** Image width in px; height follows the intrinsic ratio. @default 160 */
  width?: number;
  /** Max tilt in degrees, taken from the direction of travel. @default 12 */
  rotation?: number;
}

/**
 * ImageTrail — images fall out of the pointer as it crosses the container, each
 * one popping in, tilting into the direction of travel, then fading and shrinking
 * away.
 *
 * The detail that makes this feel right is distance-thresholded emission: nothing
 * is dropped per pointermove event. Instead the distance the pointer has travelled
 * is banked, and images are dropped at exact multiples of `threshold` measured
 * along the path, with the remainder carried into the next event — so one fast
 * event can lay down several images in a row and spacing stays exactly `threshold`
 * whatever the pointer speed. Event-rate emission would clot on a slow drag and go
 * dotted on a flick; even a naive accumulator that resets to the event position
 * would round spacing up to a whole multiple of the per-event travel.
 *
 * Images come from a fixed pool of `count` DOM nodes written round-robin, so a long
 * drag never allocates — the oldest image is simply reclaimed. Every position is
 * measured against the container's live rect at drop time, so the trail lands
 * correctly on a scrolled page, and sources are pre-decoded on mount so the first
 * pass does not flicker. The loop idles when the last image dies. Reduced motion
 * and coarse pointers drop nothing at all; the children render untouched.
 */
export function ImageTrail({
  images,
  children,
  className,
  count = 8,
  threshold = 60,
  duration = 750,
  width = 160,
  rotation = 12,
}: ImageTrailProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [fine, setFine] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Warm the cache so the first lap of the pool does not pop in blank.
  useEffect(() => {
    if (typeof window === "undefined") return;
    for (const src of images) {
      const img = new Image();
      img.src = src;
    }
  }, [images]);

  useEffect(() => {
    if (!fine || reduced || !images.length) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const items = itemRefs.current.slice(0, count).filter(Boolean) as HTMLImageElement[];
    if (!items.length) return;

    const slots = items.map(() => ({ born: -1, x: 0, y: 0, deg: 0 }));
    const gap = Math.max(1, threshold); // a zero threshold would divide by zero
    let head = 0;
    let imageIndex = 0;
    let lastX = 0;
    let lastY = 0;
    let acc = 0; // distance banked since the last drop, remainder carried forward
    let primed = false;
    let raf = 0;
    let running = false;

    const step = () => {
      const now = performance.now();
      let alive = false;

      for (let i = 0; i < items.length; i++) {
        const s = slots[i];
        if (s.born < 0) continue;
        const p = (now - s.born) / duration;
        if (p >= 1) {
          s.born = -1;
          items[i].style.opacity = "0";
          continue;
        }
        alive = true;
        // Quick pop in, long hold, accelerating fade out.
        const rise = Math.min(1, p / 0.09);
        const scale = (0.82 + 0.18 * rise) * (1 - 0.18 * p);
        items[i].style.opacity = (rise * (1 - p * p)).toFixed(3);
        items[i].style.transform =
          `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)` +
          ` translate(-50%, -50%) rotate(${s.deg.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      }

      if (alive) raf = requestAnimationFrame(step);
      else running = false;
    };

    const ensure = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(step);
      }
    };

    const emit = (x: number, y: number, dx: number) => {
      const i = head % items.length;
      head++;
      const s = slots[i];
      s.born = performance.now();
      s.x = x;
      s.y = y;
      // Lean into the swipe: dx over one threshold of travel maps to full tilt.
      s.deg = Math.max(-rotation, Math.min(rotation, (dx / gap) * rotation));
      items[i].src = images[imageIndex % images.length];
      imageIndex++;
      items[i].style.zIndex = String(head);
      ensure();
    };

    const onMove = (e: PointerEvent) => {
      // Live rect — the page may have scrolled since the last event.
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (!primed) {
        primed = true;
        lastX = x;
        lastY = y;
        acc = 0;
        return;
      }
      const dx = x - lastX;
      const dy = y - lastY;
      const seg = Math.hypot(dx, dy);
      if (seg > 0) {
        const banked = acc; // travelled before this segment began
        acc += seg;
        // Drop at exact multiples of `threshold` measured along the path, and
        // carry the remainder. Resetting the accumulator to the event position
        // instead would stretch spacing to a whole multiple of the per-event
        // travel, so a fast flick would space images further apart than a slow
        // drag — the speed dependence this whole approach exists to remove.
        const drops = Math.min(items.length, Math.floor(acc / gap));
        let along = gap - banked;
        for (let n = 0; n < drops; n++) {
          const t = Math.max(0, Math.min(1, along / seg));
          emit(lastX + dx * t, lastY + dy * t, dx);
          along += threshold;
        }
        acc %= gap;
      }
      lastX = x;
      lastY = y;
    };
    const onEnter = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      lastX = e.clientX - r.left;
      lastY = e.clientY - r.top;
      acc = 0;
      primed = true;
    };
    const onLeave = () => {
      primed = false;
    };

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      for (const el of items) el.style.opacity = "0";
    };
  }, [fine, reduced, images, count, threshold, duration, rotation]);

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden", className)}>
      {children}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: count }).map((_, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            alt=""
            aria-hidden
            draggable={false}
            decoding="async"
            className="absolute left-0 top-0 select-none rounded-lg object-cover will-change-transform"
            style={{ width, height: "auto", opacity: 0 }}
          />
        ))}
      </div>
    </div>
  );
}
