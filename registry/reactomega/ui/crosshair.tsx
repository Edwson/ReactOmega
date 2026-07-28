"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface CrosshairProps {
  /** Content the crosshair is laid over. */
  children?: React.ReactNode;
  className?: string;
  /** Hairline and reticle color. @default "#7c5cff" */
  color?: string;
  /** Hairline weight in px. @default 1 */
  thickness?: number;
  /** Elements the crosshair locks onto. @default "[data-snap]" */
  snapSelector?: string;
  /** Px from a target's edge at which the lock engages. @default 80 */
  snapDistance?: number;
  /** Show the live coordinate readout. @default true */
  showCoords?: boolean;
}

/**
 * Crosshair — a precision-instrument overlay: full-bleed hairlines tracking the
 * pointer, a corner-bracket reticle, and a monospace readout of the pointer's
 * position in container space.
 *
 * Its one real trick is snapping. Each frame the nearest element matching
 * `snapSelector` is measured with the clamped point-to-rectangle distance — zero
 * while the pointer is inside the target, so a hover always locks — and if that
 * is within `snapDistance` the crosshair acquires it. Acquisition drives a single
 * eased 0..1 value that the hairline position interpolates along, from the raw
 * pointer to the target's centre, while the reticle simultaneously grows from an
 * 18px box into a bracket around the target's bounding box. One scalar, both
 * behaviours, so the lock can never half-engage.
 *
 * Every rect — the container's and each target's — is read live each frame, so
 * the instrument stays calibrated through scrolls, resizes and layout shifts, and
 * targets added after mount are picked up automatically. Box dimensions are only
 * written when they actually change, keeping the steady state to pure transforms.
 * The loop idles once the lock has settled. The overlay is inert and aria-hidden;
 * the children below it stay fully clickable and keyboard reachable. Reduced
 * motion keeps the snapping but removes the glide, and coarse pointers get the
 * children with no overlay at all.
 */
export function Crosshair({
  children,
  className,
  color = "#7c5cff",
  thickness = 1,
  snapSelector = "[data-snap]",
  snapDistance = 80,
  showCoords = true,
}: CrosshairProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<HTMLDivElement>(null);
  const vRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!fine) return;
    const wrap = wrapRef.current;
    const layer = layerRef.current;
    const hLine = hRef.current;
    const vLine = vRef.current;
    const box = boxRef.current;
    if (!wrap || !layer || !hLine || !vLine || !box) return;

    let safeSelector = snapSelector;
    try {
      wrap.querySelector(snapSelector);
    } catch {
      safeSelector = "";
    }

    const BASE = 18; // reticle size with nothing acquired
    let px = 0;
    let py = 0;
    let inside = false;
    let lock = 0; // eased 0..1 acquisition
    let lastW = -1;
    let lastH = -1;
    let lastText = "";
    let raf = 0;
    let running = false;

    const step = () => {
      const r = wrap.getBoundingClientRect();

      // Nearest target by clamped point-to-rect distance (0 when pointer is inside it).
      let tx = px;
      let ty = py;
      let tw = BASE;
      let th = BASE;
      let found = false;
      if (inside && safeSelector) {
        let best = Infinity;
        const targets = wrap.querySelectorAll(safeSelector);
        for (let i = 0; i < targets.length; i++) {
          const b = targets[i].getBoundingClientRect();
          const left = b.left - r.left;
          const top = b.top - r.top;
          const dx = Math.max(left - px, 0, px - (left + b.width));
          const dy = Math.max(top - py, 0, py - (top + b.height));
          const d = Math.hypot(dx, dy);
          if (d <= snapDistance && d < best) {
            best = d;
            tx = left + b.width / 2;
            ty = top + b.height / 2;
            tw = b.width + 10;
            th = b.height + 10;
            found = true;
          }
        }
      }

      const target = found ? 1 : 0;
      if (reduced) lock = target;
      else lock += (target - lock) * 0.3;
      const e = lock * lock * (3 - 2 * lock); // smoothstep

      const cx = px + (tx - px) * e;
      const cy = py + (ty - py) * e;
      const bw = BASE + (tw - BASE) * e;
      const bh = BASE + (th - BASE) * e;

      hLine.style.transform = `translate3d(0, ${(cy - thickness / 2).toFixed(2)}px, 0)`;
      vLine.style.transform = `translate3d(${(cx - thickness / 2).toFixed(2)}px, 0, 0)`;
      box.style.transform = `translate3d(${(cx - bw / 2).toFixed(2)}px, ${(cy - bh / 2).toFixed(2)}px, 0)`;
      // Layout writes only when the bracket actually resizes.
      if (Math.abs(bw - lastW) > 0.5) {
        lastW = bw;
        box.style.width = `${bw.toFixed(1)}px`;
      }
      if (Math.abs(bh - lastH) > 0.5) {
        lastH = bh;
        box.style.height = `${bh.toFixed(1)}px`;
      }

      const label = labelRef.current;
      if (label) {
        const text = `${Math.round(cx)}, ${Math.round(cy)}`;
        if (text !== lastText) {
          lastText = text;
          label.textContent = text;
        }
        // Keep the readout inside the box by flipping it near the far edges.
        const flipX = cx > r.width - 96;
        const flipY = cy > r.height - 40;
        label.style.transform =
          `translate3d(${(cx + (flipX ? -14 : 14)).toFixed(1)}px, ${(cy + (flipY ? -14 : 14)).toFixed(1)}px, 0)` +
          ` translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`;
      }

      if (!reduced && Math.abs(target - lock) > 0.002) raf = requestAnimationFrame(step);
      else running = false;
    };

    const ensure = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(step);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      inside = true;
      ensure();
    };
    const onEnter = () => {
      inside = true;
      layer.style.opacity = "1";
      ensure();
    };
    const onLeave = () => {
      inside = false;
      layer.style.opacity = "0";
      ensure();
    };

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);
    ensure();

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, reduced, color, thickness, snapSelector, snapDistance, showCoords]);

  // borderStyle alone would default the unset sides to `medium` and draw a full
  // box, so every side starts at zero width and the caller adds back just two.
  const corner = (style: React.CSSProperties) => (
    <span
      className="absolute h-2.5 w-2.5"
      style={{ borderStyle: "solid", borderColor: color, borderWidth: 0, ...style }}
    />
  );

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden", className)}>
      {children}
      {fine && (
        <div
          ref={layerRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{ opacity: 0, transition: reduced ? undefined : "opacity 140ms linear" }}
        >
          <div
            ref={hRef}
            className="absolute left-0 top-0 w-full will-change-transform"
            style={{ height: thickness, background: color, opacity: 0.45 }}
          />
          <div
            ref={vRef}
            className="absolute left-0 top-0 h-full will-change-transform"
            style={{ width: thickness, background: color, opacity: 0.45 }}
          />
          <div ref={boxRef} className="absolute left-0 top-0 will-change-transform" style={{ width: 18, height: 18 }}>
            {corner({ left: -1, top: -1, borderLeftWidth: thickness + 1, borderTopWidth: thickness + 1 })}
            {corner({ right: -1, top: -1, borderRightWidth: thickness + 1, borderTopWidth: thickness + 1 })}
            {corner({ left: -1, bottom: -1, borderLeftWidth: thickness + 1, borderBottomWidth: thickness + 1 })}
            {corner({ right: -1, bottom: -1, borderRightWidth: thickness + 1, borderBottomWidth: thickness + 1 })}
          </div>
          {showCoords && (
            <div
              ref={labelRef}
              className="absolute left-0 top-0 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] leading-none tracking-tight tabular-nums will-change-transform"
              style={{ color }}
            />
          )}
        </div>
      )}
    </div>
  );
}
