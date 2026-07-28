"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface GooeyNavItem {
  /** Visible label. */
  label: string;
  /** Stable value — also used as the tab's DOM id so a panel can point at it with `aria-labelledby`. */
  id: string;
}

export interface GooeyNavProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange" | "defaultValue"> {
  /** Extra classes for the nav shell. @default undefined */
  className?: string;
  /** The items to render, left to right. @default [] */
  items?: GooeyNavItem[];
  /** Controlled selected id. @default undefined */
  value?: string;
  /** Uncontrolled starting id. @default first item's id */
  defaultValue?: string;
  /** Fires with the newly selected id. @default undefined */
  onChange?: (id: string) => void;
  /** Blob colour. @default "#7c5cff" */
  color?: string;
  /** Blur radius fed to the goo filter — higher is more liquid. @default 9 */
  gooStrength?: number;
  /** 0–1. How far the trailing blob lags, i.e. how much the blob elongates. @default 0.6 */
  stretch?: number;
}

/** ms the leading blob takes to reach the new item. */
const LEAD_MS = 380;

/**
 * GooeyNav — a pill navigation where a liquid indicator flows between items.
 * The indicator is two identically coloured blobs sharing one SVG goo filter
 * (`feGaussianBlur` → `feColorMatrix` alpha contrast, which re-hardens the
 * blurred edges so overlapping shapes fuse). The leading blob reaches the new
 * item in `LEAD_MS`; the trailing blob is given a longer duration and a small
 * delay scaled by `stretch`, so mid-flight the two are apart and the filter
 * renders them as one elongated capsule pointing back the way it came, which
 * then settles into a single pill when the trail catches up. A brief scaleY
 * squash on the leading blob adds the surface-tension snap. Geometry comes
 * from the target button's `offsetLeft` / `offsetWidth` / `offsetTop` /
 * `offsetHeight`, re-measured by a `ResizeObserver`, so the blob tracks
 * reflows and font swaps without hard-coded sizes.
 *
 * Accessibility: labels live *outside* the filtered layer (a goo filter would
 * smear text), so they stay crisp and selectable. The items are real
 * `<button>`s in a tablist with roving tabindex — Arrow keys move selection and
 * focus together, Home/End jump to the ends — and the blob is purely
 * decorative (`aria-hidden`), with `aria-selected` carrying the real state.
 * Reduced motion drops every transition and the squash: the indicator simply
 * appears at the new item.
 */
export function GooeyNav({
  className,
  items = [],
  value,
  defaultValue,
  onChange,
  color = "#7c5cff",
  gooStrength = 9,
  stretch = 0.6,
  "aria-label": ariaLabel = "Sections",
  ...rest
}: GooeyNavProps) {
  const gooId = "ro-goo-nav-" + useId().replace(/[^a-zA-Z0-9-]/g, "");
  const reduced = usePrefersReducedMotion();

  const navRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const primed = useRef(false);
  const lastLeft = useRef<number | null>(null);
  const wantFocus = useRef(false);

  const [uncontrolled, setUncontrolled] = useState(() => defaultValue ?? items[0]?.id ?? "");
  const current = value ?? uncontrolled;
  const selected = Math.max(
    0,
    items.findIndex((it) => it.id === current),
  );

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const place = useCallback(() => {
    const lead = leadRef.current;
    const trail = trailRef.current;
    const btn = btnRefs.current[selected];
    if (!lead || !trail || !btn) return;

    const left = btn.offsetLeft;
    const top = btn.offsetTop;
    const w = btn.offsetWidth;
    const h = btn.offsetHeight;
    const travelled = lastLeft.current !== null && Math.abs(left - lastLeft.current) > 0.5;
    const animate = primed.current && !reduced && travelled;
    const lag = Math.max(0, Math.min(1, stretch));
    const trailMs = LEAD_MS + 460 * lag;

    clearTimers();

    for (const [el, ms, delay] of [
      [lead, LEAD_MS, 0],
      [trail, trailMs, 70 * lag],
    ] as const) {
      el.style.transition = animate
        ? `transform ${ms}ms cubic-bezier(.2,.85,.25,1) ${delay}ms, width ${ms}ms cubic-bezier(.2,.85,.25,1) ${delay}ms, height ${ms}ms ease ${delay}ms`
        : "none";
      el.style.top = `${top}px`;
      el.style.height = `${h}px`;
      el.style.width = `${w}px`;
      el.style.transform = `translate3d(${left}px,0,0)`;
    }

    if (animate && lag > 0) {
      lead.style.transform = `translate3d(${left}px,0,0) scaleY(${1 - 0.14 * lag})`;
      timers.current.push(
        setTimeout(() => {
          lead.style.transform = `translate3d(${left}px,0,0) scaleY(1)`;
        }, LEAD_MS * 0.55),
      );
    }

    lastLeft.current = left;
    primed.current = true;
  }, [selected, reduced, stretch]);

  useEffect(() => {
    place();
  }, [place, items]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      primed.current = false;
      lastLeft.current = null;
      place();
    });
    ro.observe(nav);
    return () => ro.disconnect();
  }, [place]);

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!wantFocus.current) return;
    wantFocus.current = false;
    btnRefs.current[selected]?.focus();
  }, [selected]);

  const select = (i: number, fromKeyboard = false) => {
    const item = items[i];
    if (!item) return;
    wantFocus.current = fromKeyboard;
    if (value === undefined) setUncontrolled(item.id);
    onChange?.(item.id);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const n = items.length;
    if (!n) return;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        select((selected + 1) % n, true);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        select((selected - 1 + n) % n, true);
        break;
      case "Home":
        e.preventDefault();
        select(0, true);
        break;
      case "End":
        e.preventDefault();
        select(n - 1, true);
        break;
      default:
        break;
    }
  };

  return (
    <nav
      {...rest}
      ref={navRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-flex w-max items-center rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur",
        className,
      )}
    >
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          <filter id={gooId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(0.1, gooStrength)} result="goo" />
            <feColorMatrix in="goo" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" />
          </filter>
        </defs>
      </svg>

      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ filter: `url(#${gooId})` }}>
        <span
          ref={trailRef}
          className="absolute left-0 top-0 rounded-full will-change-transform"
          style={{ background: color }}
        />
        <span
          ref={leadRef}
          className="absolute left-0 top-0 rounded-full will-change-transform"
          style={{ background: color }}
        />
      </div>

      {items.map((item, i) => (
        <button
          key={item.id}
          id={item.id}
          type="button"
          role="tab"
          ref={(el) => {
            btnRefs.current[i] = el;
          }}
          aria-selected={i === selected}
          tabIndex={i === selected ? 0 : -1}
          onClick={() => select(i)}
          className={cn(
            "relative z-10 rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors",
            "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]",
            i === selected ? "text-white" : "text-white/60 hover:text-white/90",
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
