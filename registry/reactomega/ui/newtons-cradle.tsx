"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface NewtonsCradleProps {
  className?: string;
  /** Number of balls in the cradle. @default 5 */
  count?: number;
  /** Ball + wire color. @default "#7c5cff" */
  color?: string;
  /** Ball radius in px. @default 14 */
  ballRadius?: number;
}

/**
 * NewtonsCradle — N balls hanging in a touching row from a top bar. Drag an end
 * ball back and release; it swings down and, on impact, transfers its momentum
 * through the stationary middle balls so the opposite end ball flies out at the
 * same speed — idealized elastic collision that loops believably. For
 * reduced-motion users the balls hang straight and still, just touching.
 */
export function NewtonsCradle({
  className,
  count = 5,
  color = "#7c5cff",
  ballRadius = 14,
}: NewtonsCradleProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, barY = 0, len = 0, gap = 0, startX = 0;
    // Each ball: angle (rad, 0 = vertical), angular velocity.
    let angles: number[] = [];
    let vels: number[] = [];
    const pivot: number[] = [];
    const g = 0.00045; // gravity term tuned for px-scale pendulum
    const mouse = { down: false, grab: -1, angle: 0 };
    let raf = 0;
    let last = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      barY = Math.max(10, h * 0.1);
      len = Math.min(h * 0.62, h - barY - ballRadius - 12);
      gap = ballRadius * 2 + 0.5; // pivots spaced by ball diameter so balls touch
      const totalW = gap * (count - 1);
      startX = (w - totalW) / 2;
      pivot.length = 0;
      for (let i = 0; i < count; i++) pivot.push(startX + i * gap);
      angles = new Array(count).fill(0);
      vels = new Array(count).fill(0);
      // give the cradle an initial lift on the first ball so it animates on load
      if (!reduced && count > 0) angles[0] = -0.6;
      last = 0;
    };

    // detect & resolve elastic transfer at the touching row
    const collide = () => {
      // left end swinging right (angle >= 0 region) hitting the cluster
      for (let i = 0; i < count - 1; i++) {
        const a = angles[i], b = angles[i + 1];
        // adjacent balls overlap when (a - b) closes past contact and i moves toward i+1
        if (a > b && vels[i] > 0) {
          // i is pressing into i+1: hand off velocity (equal mass elastic 1D)
          const rel = vels[i];
          if (rel > 0.00002) {
            vels[i] = 0; vels[i + 1] = rel;
            angles[i] = b; // rest at contact
          }
        }
      }
      // right end swinging left hitting the cluster
      for (let i = count - 1; i > 0; i--) {
        const a = angles[i], b = angles[i - 1];
        if (a < b && vels[i] < 0) {
          const rel = vels[i];
          if (rel < -0.00002) {
            vels[i] = 0; vels[i - 1] = rel;
            angles[i] = b;
          }
        }
      }
    };

    const physics = (dt: number) => {
      const sub = 6;
      const hStep = dt / sub;
      for (let s = 0; s < sub; s++) {
        for (let i = 0; i < count; i++) {
          if (mouse.down && mouse.grab === i) continue;
          const acc = -g * Math.sin(angles[i]);
          vels[i] += acc * hStep;
          vels[i] *= 0.9999;
          angles[i] += vels[i] * hStep;
        }
        if (mouse.down && mouse.grab >= 0) {
          angles[mouse.grab] = mouse.angle;
          vels[mouse.grab] = 0;
        }
        collide();
      }
    };

    const draw = (t: number) => {
      if (!reduced) {
        if (!last) last = t;
        const dt = Math.min(48, t - last);
        last = t;
        physics(dt);
      }
      ctx.clearRect(0, 0, w, h);
      // top bar
      ctx.strokeStyle = "rgba(255,255,255,.2)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX - ballRadius, barY);
      ctx.lineTo(startX + gap * (count - 1) + ballRadius, barY);
      ctx.stroke();
      for (let i = 0; i < count; i++) {
        const a = reduced ? 0 : angles[i];
        const bx = pivot[i] + Math.sin(a) * len;
        const by = barY + Math.cos(a) * len;
        ctx.strokeStyle = "rgba(124,92,255,.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pivot[i], barY);
        ctx.lineTo(bx, by);
        ctx.stroke();
        const grd = ctx.createRadialGradient(bx - ballRadius * 0.35, by - ballRadius * 0.35, ballRadius * 0.15, bx, by, ballRadius);
        grd.addColorStop(0, "rgba(255,255,255,.85)");
        grd.addColorStop(0.25, color);
        grd.addColorStop(1, "#3a2a7a");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(bx, by, ballRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const rel = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const angleFromPoint = (i: number, x: number, y: number) => Math.atan2(x - pivot[i], y - barY);
    const onDown = (e: PointerEvent) => {
      const m = rel(e);
      // grab an end ball whose bob is nearest the pointer
      let best = -1, bestD = ballRadius * 3.5;
      for (const i of [0, count - 1]) {
        const a = angles[i];
        const bx = pivot[i] + Math.sin(a) * len, by = barY + Math.cos(a) * len;
        const d = Math.hypot(bx - m.x, by - m.y);
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best < 0) return;
      mouse.down = true; mouse.grab = best;
      let ang = angleFromPoint(best, m.x, m.y);
      ang = Math.max(-1.1, Math.min(1.1, ang));
      mouse.angle = ang;
    };
    const onMove = (e: PointerEvent) => {
      if (!mouse.down || mouse.grab < 0) return;
      const m = rel(e);
      let ang = angleFromPoint(mouse.grab, m.x, m.y);
      // end balls can only be pulled outward, not into the cluster
      if (mouse.grab === 0) ang = Math.min(0, Math.max(-1.1, ang));
      else if (mouse.grab === count - 1) ang = Math.max(0, Math.min(1.1, ang));
      mouse.angle = ang;
    };
    const onUp = () => { mouse.down = false; mouse.grab = -1; };

    build();
    if (reduced) draw(0);
    else raf = requestAnimationFrame(draw);
    window.addEventListener("resize", build);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [count, color, ballRadius, reduced]);

  return <canvas ref={ref} className={cn("h-full w-full touch-none", className)} />;
}
