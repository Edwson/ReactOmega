"use client";

import { createContext, useContext, useEffect, useId, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/** Called once per animation frame with grid-relative pointer coordinates. */
type TileFrame = (gx: number, gy: number, inside: boolean) => void;

interface BentoContextValue {
  register: (fn: TileFrame) => () => void;
  columns: number;
  tilt: number;
  spotlight: boolean;
  reduced: boolean;
}

const BentoContext = createContext<BentoContextValue>({
  register: () => () => {},
  columns: 4,
  tilt: 0,
  spotlight: false,
  reduced: true,
});

/** px beyond a tile's edge at which its border glow reaches zero. */
const GLOW_FALLOFF = 220;

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Extra classes for the grid. @default undefined */
  className?: string;
  /** `BentoTile` children. @default undefined */
  children?: React.ReactNode;
  /** Columns at the large breakpoint — halved at `sm`, single column below. @default 4 */
  columns?: number;
  /** Gutter in px. @default 16 */
  gap?: number;
  /** Minimum height of each grid row in px. @default 140 */
  rowHeight?: number;
  /** Track the pointer with a radial spotlight that crosses tile boundaries. @default true */
  spotlight?: boolean;
  /** Spotlight colour at its centre. @default "rgba(124,92,255,.20)" */
  spotlightColor?: string;
  /** Maximum per-tile tilt in degrees, 0 disables. @default 6 */
  tilt?: number;
}

/**
 * BentoGrid — a responsive bento layout that behaves like one surface rather
 * than a pile of independent cards. The grid owns the *only* pointer listener:
 * on each animation frame it reads its own live `getBoundingClientRect()` and
 * publishes grid-relative coordinates as the inherited custom properties
 * `--ro-gx` / `--ro-gy`. Because custom properties cascade, every tile's
 * spotlight is pure CSS — each tile subtracts its own `offsetLeft` / `offsetTop`
 * (`--ro-ox` / `--ro-oy`) inside `calc()`, so a single radial gradient appears
 * continuous across gutters with zero per-tile listeners. Effects that CSS
 * cannot express from those variables — the 3D tilt and the proximity border
 * glow — are driven by the same frame: tiles subscribe a callback and the grid
 * fans out to them, writing `style.transform` directly instead of through React
 * state. Only transforms and custom properties are written, so layout stays
 * clean and the per-frame offset reads stay cheap.
 *
 * Reduced motion detaches the listener entirely: no tracking, no tilt, no
 * per-frame work. Tiles fall back to a static hover border so they still read
 * as interactive, and links stay links.
 */
export function BentoGrid({
  className,
  children,
  columns = 4,
  gap = 16,
  rowHeight = 140,
  spotlight = true,
  spotlightColor = "rgba(124,92,255,.20)",
  tilt = 6,
  style,
  ...rest
}: BentoGridProps) {
  const reduced = usePrefersReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const subs = useRef<Set<TileFrame>>(new Set());
  const cls = "ro-bento-" + useId().replace(/[^a-zA-Z0-9-]/g, "");

  const ctx = useMemo<BentoContextValue>(
    () => ({
      register: (fn: TileFrame) => {
        subs.current.add(fn);
        return () => {
          subs.current.delete(fn);
        };
      },
      columns: Math.max(1, Math.round(columns)),
      tilt: reduced ? 0 : Math.max(0, tilt),
      spotlight: spotlight && !reduced,
      reduced,
    }),
    [columns, tilt, spotlight, reduced],
  );

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || reduced || (!spotlight && tilt <= 0)) return;

    let raf = 0;
    let cx = 0;
    let cy = 0;
    let inside = false;

    const frame = () => {
      raf = 0;
      // Live rect every frame — the page scrolls and a cached rect goes stale.
      const r = grid.getBoundingClientRect();
      const gx = inside ? cx - r.left : -9999;
      const gy = inside ? cy - r.top : -9999;
      grid.style.setProperty("--ro-gx", `${gx}px`);
      grid.style.setProperty("--ro-gy", `${gy}px`);
      subs.current.forEach((fn) => fn(gx, gy, inside));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onMove = (e: PointerEvent) => {
      cx = e.clientX;
      cy = e.clientY;
      inside = true;
      schedule();
    };
    const onLeave = () => {
      inside = false;
      schedule();
    };

    grid.addEventListener("pointermove", onMove, { passive: true });
    grid.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      grid.removeEventListener("pointermove", onMove);
      grid.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, spotlight, tilt]);

  const cols = Math.max(1, Math.round(columns));
  const sm = Math.min(2, cols);

  return (
    <div
      {...rest}
      ref={gridRef}
      className={cn("relative grid w-full", cls, className)}
      style={
        {
          gap,
          gridAutoRows: `minmax(${rowHeight}px, auto)`,
          "--ro-gx": "-9999px",
          "--ro-gy": "-9999px",
          "--ro-spot": spotlightColor,
          "--ro-r": "300px",
          ...style,
        } as React.CSSProperties
      }
    >
      <style>{`.${cls}{grid-template-columns:repeat(1,minmax(0,1fr))}@media(min-width:640px){.${cls}{grid-template-columns:repeat(${sm},minmax(0,1fr))}}@media(min-width:1024px){.${cls}{grid-template-columns:repeat(${cols},minmax(0,1fr))}}`}</style>
      <BentoContext.Provider value={ctx}>{children}</BentoContext.Provider>
    </div>
  );
}

export interface BentoTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Extra classes for the tile. @default undefined */
  className?: string;
  /** Tile content. @default undefined */
  children?: React.ReactNode;
  /** Columns to span at the large breakpoint, clamped to the grid width. @default 1 */
  colSpan?: number;
  /** Rows to span at the large breakpoint. @default 1 */
  rowSpan?: number;
  /** Render as a link. Tiles with an href are real anchors and keyboard reachable. @default undefined */
  href?: string;
}

/**
 * BentoTile — one cell of a `BentoGrid`. Its span collapses to a single column
 * on small screens (a 2-wide tile inside a 1-column grid would otherwise create
 * a phantom track), widens to at most two at `sm`, and takes its full span at
 * `lg`. It subscribes to the grid's shared pointer frame to write its own tilt
 * transform and `--ro-glow` proximity value, and exposes its `offsetLeft` /
 * `offsetTop` as custom properties so the grid-wide spotlight can be positioned
 * from CSS alone. With an `href` it renders an `<a>`; without one it is a plain
 * container, never a div pretending to be a button.
 */
export function BentoTile({
  className,
  children,
  colSpan = 1,
  rowSpan = 1,
  href,
  style,
  ...rest
}: BentoTileProps) {
  const { register, columns, tilt, spotlight, reduced } = useContext(BentoContext);
  const ref = useRef<HTMLElement | null>(null);
  const cls = "ro-tile-" + useId().replace(/[^a-zA-Z0-9-]/g, "");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      el.style.setProperty("--ro-ox", `${el.offsetLeft}px`);
      el.style.setProperty("--ro-oy", `${el.offsetTop}px`);
    };
    sync();
    if (reduced) return;

    const onFrame: TileFrame = (gx, gy, inside) => {
      const ox = el.offsetLeft;
      const oy = el.offsetTop;
      const w = el.offsetWidth || 1;
      const h = el.offsetHeight || 1;
      el.style.setProperty("--ro-ox", `${ox}px`);
      el.style.setProperty("--ro-oy", `${oy}px`);

      const dx = Math.max(ox - gx, 0, gx - (ox + w));
      const dy = Math.max(oy - gy, 0, gy - (oy + h));
      const dist = Math.hypot(dx, dy);
      el.style.setProperty("--ro-glow", inside ? Math.max(0, 1 - dist / GLOW_FALLOFF).toFixed(3) : "0");

      if (tilt > 0) {
        if (inside && dist === 0) {
          const px = (gx - ox) / w;
          const py = (gy - oy) / h;
          el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 2 * tilt).toFixed(2)}deg) rotateY(${(
            (px - 0.5) *
            2 *
            tilt
          ).toFixed(2)}deg)`;
        } else {
          el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
        }
      }
    };
    const off = register(onFrame);
    return () => off();
  }, [register, tilt, reduced]);

  const c = Math.max(1, Math.min(Math.round(colSpan), Math.max(1, columns)));
  const sm = Math.min(c, 2);
  const r = Math.max(1, Math.round(rowSpan));

  const shell = cn(
    "group relative isolate block overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5",
    "outline-none backdrop-blur will-change-transform",
    "focus-visible:ring-2 focus-visible:ring-[#7c5cff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]",
    reduced && "transition-colors hover:border-white/25",
    cls,
    className,
  );

  const spans = (
    <style>{`.${cls}{grid-column:span 1/span 1;grid-row:span 1/span 1}@media(min-width:640px){.${cls}{grid-column:span ${sm}/span ${sm}}}@media(min-width:1024px){.${cls}{grid-column:span ${c}/span ${c};grid-row:span ${r}/span ${r}}}`}</style>
  );

  const inner = (
    <>
      {spotlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background:
              "radial-gradient(var(--ro-r,300px) circle at calc(var(--ro-gx,-9999px) - var(--ro-ox,0px)) calc(var(--ro-gy,-9999px) - var(--ro-oy,0px)), var(--ro-spot,rgba(124,92,255,.20)), transparent 72%)",
          }}
        />
      )}
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/25"
          style={{ opacity: "var(--ro-glow,0)" } as React.CSSProperties}
        />
      )}
      <div className="relative h-full">{children}</div>
    </>
  );

  const inlineStyle: React.CSSProperties = {
    transition: reduced ? undefined : "transform .18s cubic-bezier(.2,.7,.3,1)",
    ...style,
  };

  if (href) {
    return (
      <>
        {spans}
        <a
          {...(rest as React.HTMLAttributes<HTMLAnchorElement>)}
          href={href}
          ref={(el) => {
            ref.current = el;
          }}
          className={shell}
          style={inlineStyle}
        >
          {inner}
        </a>
      </>
    );
  }

  return (
    <>
      {spans}
      <div
        {...rest}
        ref={(el) => {
          ref.current = el;
        }}
        className={shell}
        style={inlineStyle}
      >
        {inner}
      </div>
    </>
  );
}
