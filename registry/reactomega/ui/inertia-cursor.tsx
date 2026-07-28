"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface InertiaCursorProps {
  className?: string;
  /** Diameter of the precise inner dot in px. @default 7 */
  size?: number;
  /** Diameter of the lagging outer ring in px. @default 34 */
  ringSize?: number;
  /** Ring spring acceleration, 0..1 — higher catches up faster. @default 0.18 */
  stiffness?: number;
  /** Ring spring damping, 0..1 — lower kills the bounce harder. @default 0.62 */
  damping?: number;
  /** Ring scale while hovering an interactive target. @default 1.7 */
  hoverScale?: number;
  /** Selector the ring reacts to, tested with closest() on whatever is hovered. @default "a, button, [data-cursor]" */
  selector?: string;
  /** Cursor color. Painted with mix-blend-mode difference, so white inverts whatever sits behind it. @default "#ffffff" */
  color?: string;
  /** Hide the native cursor while this one is on screen. @default true */
  hideNative?: boolean;
}

/**
 * InertiaCursor — a two-part cursor replacement: a small dot pinned exactly to
 * the pointer, and a larger ring that trails behind it on a spring, so fast
 * flicks stretch the pair apart and a stop lets the ring coast in.
 *
 * Hover state is delegated from `document` via pointerover, so the ring reacts
 * to elements that were added to the DOM long after mount, and a scroll listener
 * re-tests the node under the cursor for the case where the page moves but the
 * mouse does not. Both halves are painted with `mix-blend-mode: difference`,
 * which keeps them readable over any background without knowing anything about
 * it. Positions are resolved against the overlay's live rect each frame so the
 * cursor stays true even if an ancestor transform captures the fixed container.
 *
 * The rAF loop idles as soon as the ring and the hover spring have settled and
 * restarts on the next pointer event. Coarse pointers render nothing at all —
 * a lagging ring on a touchscreen is just a stuck artifact. Reduced motion drops
 * the spring and the scale: the ring simply follows.
 */
export function InertiaCursor({
  className,
  size = 7,
  ringSize = 34,
  stiffness = 0.18,
  damping = 0.62,
  hoverScale = 1.7,
  selector = "a, button, [data-cursor]",
  color = "#ffffff",
  hideNative = true,
}: InertiaCursorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);
  const reduced = usePrefersReducedMotion();

  // Only mouse-like pointers get a cursor replacement.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Swap out the native cursor for ours, and put it back exactly as we found it.
  useEffect(() => {
    if (!fine || !hideNative) return;
    const style = document.createElement("style");
    style.textContent = ".ro-cursor-none, .ro-cursor-none * { cursor: none !important; }";
    document.head.appendChild(style);
    document.documentElement.classList.add("ro-cursor-none");
    return () => {
      document.documentElement.classList.remove("ro-cursor-none");
      style.remove();
    };
  }, [fine, hideNative]);

  useEffect(() => {
    if (!fine) return;
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!root || !dot || !ring) return;

    // An invalid selector would throw on every single pointerover, so test it once.
    let safeSelector = selector;
    try {
      document.querySelector(selector);
    } catch {
      safeSelector = "";
    }

    // Viewport coords of the pointer; ring position and hover amount are sprung.
    let px = -9999;
    let py = -9999;
    let rx = -9999;
    let ry = -9999;
    let vx = 0;
    let vy = 0;
    let hover = 0;
    let hoverV = 0;
    let hoverTarget = 0;
    let seen = false;
    let raf = 0;
    let running = false;

    const step = () => {
      // Live rect: if an ancestor transform has captured our fixed container,
      // this keeps the cursor glued to the real pointer anyway.
      const r = root.getBoundingClientRect();

      if (reduced) {
        rx = px;
        ry = py;
        vx = 0;
        vy = 0;
        hover = hoverTarget;
        hoverV = 0;
      } else {
        vx = (vx + (px - rx) * stiffness) * damping;
        vy = (vy + (py - ry) * stiffness) * damping;
        rx += vx;
        ry += vy;
        hoverV = (hoverV + (hoverTarget - hover) * stiffness) * damping;
        hover += hoverV;
      }

      const scale = 1 + (hoverScale - 1) * hover;
      dot.style.transform = `translate3d(${(px - r.left).toFixed(2)}px, ${(py - r.top).toFixed(2)}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${(rx - r.left).toFixed(2)}px, ${(ry - r.top).toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      ring.style.opacity = (0.55 + 0.45 * Math.max(0, Math.min(1, hover))).toFixed(3);

      const moving =
        Math.abs(px - rx) > 0.05 ||
        Math.abs(py - ry) > 0.05 ||
        Math.abs(vx) > 0.05 ||
        Math.abs(vy) > 0.05 ||
        Math.abs(hoverTarget - hover) > 0.002 ||
        Math.abs(hoverV) > 0.002;

      if (moving) raf = requestAnimationFrame(step);
      else running = false;
    };

    const ensure = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(step);
      }
    };

    const testHover = (node: EventTarget | Element | null) => {
      if (!safeSelector) return;
      hoverTarget = node instanceof Element && node.closest(safeSelector) ? 1 : 0;
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!seen) {
        // First sighting: drop the ring on the pointer instead of flying it in
        // from the corner, then fade the pair up.
        seen = true;
        rx = px;
        ry = py;
        root.style.opacity = "1";
      }
      ensure();
    };
    const onOver = (e: PointerEvent) => {
      testHover(e.target);
      ensure();
    };
    const onScroll = () => {
      if (!seen) return;
      testHover(document.elementFromPoint(px, py));
      ensure();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      root.style.opacity = "0";
      seen = false;
      hoverTarget = 0;
      ensure();
    };
    const onBlur = () => {
      root.style.opacity = "0";
      seen = false;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", onBlur);
    ensure();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onBlur);
    };
  }, [fine, reduced, stiffness, damping, hoverScale, selector]);

  if (!fine) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-[9999]", className)}
      style={{ mixBlendMode: "difference", opacity: 0, transition: reduced ? undefined : "opacity 180ms linear" }}
    >
      <div
        ref={dotRef}
        className="absolute left-0 top-0 rounded-full will-change-transform"
        style={{ width: size, height: size, background: color }}
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 rounded-full will-change-transform"
        style={{ width: ringSize, height: ringSize, border: `1.5px solid ${color}` }}
      />
    </div>
  );
}
