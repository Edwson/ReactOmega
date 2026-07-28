"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface CircularGalleryItem {
  /** Image URL. */
  src: string;
  /** Alternative text. Use "" for purely decorative imagery. */
  alt: string;
  /** Caption shown under the image and announced as the item's name. */
  label: string;
}

export interface CircularGalleryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "children"> {
  /** Extra classes for the gallery shell. @default undefined */
  className?: string;
  /** Items placed evenly around the cylinder. @default [] */
  items?: CircularGalleryItem[];
  /** Cylinder radius in px — larger is a flatter arc. @default 420 */
  radius?: number;
  /** Width of one item in px. @default 220 */
  itemWidth?: number;
  /** Settle to the nearest item once the spin decays. @default true */
  snap?: boolean;
  /** Per-frame velocity multiplier after release, 0–1. @default 0.94 */
  friction?: number;
  /** Idle spin in degrees per second, 0 disables. @default 0 */
  autoRotate?: number;
  /** Fires when an item is chosen. @default undefined */
  onSelect?: (index: number, item: CircularGalleryItem) => void;
}

/** px of pointer travel before a press becomes a drag rather than a tap. */
const DRAG_SLOP = 4;

const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * CircularGallery — items pinned to the surface of a horizontal cylinder in CSS
 * 3D. Each item is fixed at `rotateY(i · 360/n) translateZ(radius)`, and only
 * the stage they share is animated: `translateZ(-radius) rotateY(rot)` pushes
 * the cylinder back by its own radius so the front item lands on the screen
 * plane at true size instead of looming at the camera. Dragging converts
 * pointer travel to rotation through the arc length of the cylinder
 * (`360 / 2πr` degrees per pixel), so the surface tracks the finger 1:1 whatever
 * the radius. Release hands the last frame's delta to an inertial integrator
 * that decays by `friction` each frame and then, if `snap` is on, eases to the
 * nearest multiple of the angle step — chosen as the equivalent angle closest
 * to the current rotation, so it never unwinds the long way round. Depth is
 * read back from each item's world angle: `cos` of the angle to the viewer
 * drives opacity and scale, and items past the horizon lose pointer events so
 * you cannot click the back of the cylinder through the front. Rotation is
 * written straight to `style.transform` every frame; only the active index is
 * React state.
 *
 * Accessibility: every item is a real `<button>` in a roving-tabindex group
 * with Arrow/Home/End navigation, there are labelled previous/next controls,
 * and a polite live region announces the centred item. Pointer capture is
 * claimed only after `DRAG_SLOP` px of movement, so a plain tap still reaches
 * the button underneath and focus is never trapped. `touch-action: pan-y` keeps
 * the horizontal drag while leaving vertical page scrolling to the browser, and
 * the wheel is only intercepted for horizontal intent. Reduced motion removes
 * inertia, snapping easing and auto-rotation — dragging and the keyboard still
 * move the cylinder, they just arrive instantly.
 */
export function CircularGallery({
  className,
  items = [],
  radius = 420,
  itemWidth = 220,
  snap = true,
  friction = 0.94,
  autoRotate = 0,
  onSelect,
  "aria-label": ariaLabel = "Gallery",
  style,
  ...rest
}: CircularGalleryProps) {
  const reduced = usePrefersReducedMotion();
  const n = items.length;
  const stepDeg = n ? 360 / n : 360;
  const degPerPx = 360 / (2 * Math.PI * Math.max(1, radius));
  const itemHeight = Math.round(itemWidth * 1.28);

  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const rot = useRef(0);
  const vel = useRef(0);
  const target = useRef<number | null>(null);
  const dragging = useRef(false);
  const pending = useRef(false);
  const moved = useRef(false);
  const lastX = useRef(0);
  const hovered = useRef(false);
  const raf = useRef(0);
  const wantFocus = useRef(false);

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const paint = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.transform = `translateZ(${-radius}px) rotateY(${rot.current.toFixed(3)}deg)`;
    for (let i = 0; i < n; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const world = ((i * stepDeg + rot.current) * Math.PI) / 180;
      const facing = (Math.cos(world) + 1) / 2; // 0 = directly behind, 1 = dead centre
      const sc = 0.82 + 0.18 * facing;
      el.style.transform = `rotateY(${i * stepDeg}deg) translateZ(${radius}px) scale(${sc.toFixed(3)})`;
      el.style.opacity = (0.1 + 0.9 * Math.pow(facing, 1.7)).toFixed(3);
      el.style.pointerEvents = facing < 0.55 ? "none" : "auto";
    }
    if (target.current === null && n) {
      const idx = mod(Math.round(-rot.current / stepDeg), n);
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
    }
  }, [n, radius, stepDeg]);

  const nearestTarget = useCallback(() => {
    if (!n) return 0;
    return Math.round(rot.current / stepDeg) * stepDeg;
  }, [n, stepDeg]);

  const tick = useCallback(() => {
    raf.current = 0;
    if (!dragging.current) {
      if (autoRotate && !reduced && !hovered.current && target.current === null && vel.current === 0) {
        rot.current += autoRotate / 60;
      } else if (target.current !== null) {
        if (reduced) {
          rot.current = target.current;
          target.current = null;
        } else {
          const diff = target.current - rot.current;
          rot.current += diff * 0.16;
          if (Math.abs(diff) < 0.02) {
            rot.current = target.current;
            target.current = null;
          }
        }
      } else if (vel.current !== 0) {
        rot.current += vel.current;
        vel.current *= Math.min(0.999, Math.max(0.5, friction));
        if (Math.abs(vel.current) < 0.02) {
          vel.current = 0;
          if (snap && !autoRotate) target.current = nearestTarget();
        }
      }
    }
    paint();
    const busy =
      dragging.current ||
      vel.current !== 0 ||
      target.current !== null ||
      (!!autoRotate && !reduced && !hovered.current);
    if (busy) raf.current = requestAnimationFrame(tick);
  }, [autoRotate, reduced, friction, snap, nearestTarget, paint]);

  const ensureLoop = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    paint();
    if (autoRotate && !reduced) ensureLoop();
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [paint, ensureLoop, autoRotate, reduced]);

  useEffect(() => {
    if (!wantFocus.current) return;
    wantFocus.current = false;
    itemRefs.current[active]?.focus();
  }, [active]);

  const goTo = useCallback(
    (index: number, fromKeyboard = false) => {
      if (!n) return;
      const i = mod(index, n);
      // Pick the equivalent angle closest to where we are, so we never unwind.
      const raw = -i * stepDeg;
      const t = raw + Math.round((rot.current - raw) / 360) * 360;
      vel.current = 0;
      activeRef.current = i;
      wantFocus.current = fromKeyboard;
      setActive(i);
      if (reduced) {
        rot.current = t;
        target.current = null;
        paint();
      } else {
        target.current = t;
        ensureLoop();
      }
    },
    [n, stepDeg, reduced, paint, ensureLoop],
  );

  // Horizontal wheel only — vertical scrolling still belongs to the page.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      target.current = null;
      rot.current -= e.deltaX * degPerPx;
      vel.current = reduced ? 0 : -e.deltaX * degPerPx * 0.35;
      ensureLoop();
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [degPerPx, reduced, ensureLoop]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== undefined && e.button !== 0) return;
    pending.current = true;
    moved.current = false;
    lastX.current = e.clientX;
    vel.current = 0;
    target.current = null;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pending.current && !dragging.current) return;
    const dx = e.clientX - lastX.current;
    if (pending.current) {
      if (Math.abs(dx) < DRAG_SLOP) return;
      pending.current = false;
      dragging.current = true;
      moved.current = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    lastX.current = e.clientX;
    const d = dx * degPerPx;
    rot.current += d;
    vel.current = reduced ? 0 : d;
    ensureLoop();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pending.current) pending.current = false;
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (reduced) {
      vel.current = 0;
      if (snap) target.current = nearestTarget();
    } else if (vel.current === 0 && snap && !autoRotate) {
      target.current = nearestTarget();
    }
    ensureLoop();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!n) return;
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

  const choose = (i: number) => {
    if (moved.current) {
      moved.current = false;
      return;
    }
    goTo(i);
    const item = items[i];
    if (item) onSelectRef.current?.(i, item);
  };

  const navBtn =
    "grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 outline-none backdrop-blur transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#7c5cff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]";

  return (
    <div
      {...rest}
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      onFocus={() => {
        hovered.current = true;
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        hovered.current = false;
        ensureLoop();
      }}
      className={cn("relative w-full select-none", className)}
      style={style}
    >
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => {
          hovered.current = true;
        }}
        onPointerLeave={() => {
          hovered.current = false;
          ensureLoop();
        }}
        className="relative w-full cursor-grab overflow-hidden active:cursor-grabbing"
        style={{
          height: itemHeight + 88,
          perspective: Math.max(600, radius * 2.2),
          touchAction: "pan-y",
        }}
      >
        <div
          ref={stageRef}
          className="absolute left-1/2 top-1/2 h-0 w-0 will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((item, i) => (
            <button
              key={`${item.src}-${i}`}
              type="button"
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              tabIndex={i === active ? 0 : -1}
              aria-current={i === active ? "true" : undefined}
              onClick={() => choose(i)}
              className={cn(
                "absolute rounded-2xl border border-white/10 bg-white/5 p-2 text-left outline-none backdrop-blur",
                "focus-visible:ring-2 focus-visible:ring-[#7c5cff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]",
              )}
              style={{
                width: itemWidth,
                marginLeft: -itemWidth / 2,
                marginTop: -(itemHeight + 34) / 2,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                draggable={false}
                className="pointer-events-none block w-full rounded-xl object-cover"
                style={{ height: itemHeight }}
              />
              <span className="mt-2 block truncate px-1 text-xs text-white/70">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button type="button" className={navBtn} onClick={() => goTo(active - 1)} aria-label="Previous item">
          <span aria-hidden>&#8592;</span>
        </button>
        <button type="button" className={navBtn} onClick={() => goTo(active + 1)} aria-label="Next item">
          <span aria-hidden>&#8594;</span>
        </button>
      </div>

      <div aria-live="polite" role="status" className="sr-only">
        {n ? `${items[active]?.label ?? ""}, item ${active + 1} of ${n}` : "Empty gallery"}
      </div>
    </div>
  );
}
