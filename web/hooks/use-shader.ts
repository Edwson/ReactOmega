"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/** A uniform value: float, vec2, vec3 or vec4. */
export type UniformValue = number | readonly [number, number] | readonly [number, number, number] | readonly [number, number, number, number];

export interface UseShaderOptions {
  /**
   * GLSL ES 3.00 fragment shader body. The hook prepends `#version 300 es`,
   * a highp precision qualifier, the built-in uniforms and `out vec4 fragColor`
   * — so your source starts at your own helpers / `void main()`.
   *
   * Built-ins available to every shader:
   *   uniform vec2  uResolution;  // drawing-buffer size in device pixels
   *   uniform float uTime;        // seconds since mount, scaled by `speed`
   *   uniform vec3  uPointer;     // xy = pointer in device px (y up), z = 0..1 eased hover
   */
  fragment: string;
  /**
   * Custom uniforms. Declarations are generated from the arity of each value,
   * so `{ uTint: [0.48, 0.36, 1] }` emits `uniform vec3 uTint;` automatically.
   * Values are re-read every frame — changing a prop never recompiles.
   */
  uniforms?: Record<string, UniformValue>;
  /** Time multiplier. @default 1 */
  speed?: number;
  /** Device-pixel-ratio ceiling. Caps GPU cost on retina displays. @default 2 */
  dpr?: number;
  /** Track the pointer and feed `uPointer`. @default true */
  pointer?: boolean;
  /** Freeze the loop without unmounting. @default false */
  paused?: boolean;
  /**
   * Frozen timestamp rendered as a single still frame for reduced-motion
   * users — pick one where the shader looks composed. @default 12
   */
  staticTime?: number;
}

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const TYPES = ["float", "vec2", "vec3", "vec4"];
const arity = (v: UniformValue) => (typeof v === "number" ? 1 : v.length);

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // A lost context fails every compile with a null info log. That is not a
    // shader error and the restore handler will rebuild — don't cry wolf.
    if (process.env.NODE_ENV !== "production" && !gl.isContextLost()) {
      console.error("[ReactOmega] shader compile failed:\n" + gl.getShaderInfoLog(sh));
    }
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/**
 * useShader — a dependency-free raw WebGL2 runtime for full-screen fragment shaders.
 *
 * Draws a single full-screen triangle with no vertex buffers (positions come from
 * `gl_VertexID`), so there is nothing to allocate and nothing to leak. It owns the
 * whole lifecycle: DPR-clamped sizing via ResizeObserver, an IntersectionObserver
 * that suspends the render loop while the canvas is off-screen, pausing on tab
 * blur, context-loss recovery, eased pointer input, and a single still frame for
 * reduced-motion users. Time does not jump after a pause — it accumulates only
 * while visible.
 *
 * Returns the canvas ref plus `supported`, which is `false` when WebGL2 is
 * unavailable so the component can fall back to CSS instead of a blank box.
 */
export function useShader({
  fragment,
  uniforms,
  speed = 1,
  dpr = 2,
  pointer = true,
  paused = false,
  staticTime = 12,
}: UseShaderOptions) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [supported, setSupported] = useState(true);
  const reduced = usePrefersReducedMotion();

  // Latest values, re-read each frame so prop changes never trigger a recompile.
  const live = useRef({ uniforms, speed, paused });
  live.current = { uniforms, speed, paused };

  // Uniform declarations are part of the program source, so they *are* a dep.
  const signature = uniforms ? Object.entries(uniforms).map(([k, v]) => `${k}:${arity(v)}`).join(",") : "";

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: false,
    });
    if (!gl) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const decls = Object.entries(live.current.uniforms ?? {})
      .map(([k, v]) => `uniform ${TYPES[arity(v) - 1]} ${k};`)
      .join("\n");

    const frag = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uPointer;
${decls}
out vec4 fragColor;
${fragment}`;

    let program: WebGLProgram | null = null;
    let locs: Record<string, WebGLUniformLocation | null> = {};

    const build = () => {
      if (gl.isContextLost()) return false; // the restore handler will retry
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
      if (!vs || !fs) return false;
      const p = gl.createProgram();
      if (!p) return false;
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        if (process.env.NODE_ENV !== "production" && !gl.isContextLost()) {
          console.error("[ReactOmega] shader link failed:\n" + gl.getProgramInfoLog(p));
        }
        gl.deleteProgram(p);
        return false;
      }
      program = p;
      locs = {};
      gl.useProgram(p);
      return true;
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      program = null;
    };
    const onRestored = () => {
      if (build()) {
        w = h = 0;
        resizeRef.current?.();
        if (reduced) drawRef.current?.(staticTime);
      } else {
        setSupported(false);
      }
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    // Registered above so a context that is already down at mount can still come
    // back. Only a genuine compile/link failure marks the component unsupported.
    if (!build() && !gl.isContextLost()) {
      setSupported(false);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      return;
    }

    const loc = (name: string) => (name in locs ? locs[name] : (locs[name] = gl.getUniformLocation(program!, name)));

    // onRestored is registered before resize/draw are defined, so it reaches
    // them indirectly.
    const resizeRef: { current: (() => void) | null } = { current: null };
    const drawRef: { current: ((t: number) => void) | null } = { current: null };

    // ---- sizing -------------------------------------------------------------
    let w = 0;
    let h = 0;
    const ratio = () => Math.min(dpr, typeof window === "undefined" ? 1 : window.devicePixelRatio || 1);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const px = ratio();
      const nw = Math.max(1, Math.round(r.width * px));
      const nh = Math.max(1, Math.round(r.height * px));
      if (nw === w && nh === h) return;
      w = canvas.width = nw;
      h = canvas.height = nh;
      gl.viewport(0, 0, w, h);
    };
    resizeRef.current = resize;
    resize();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    // ---- pointer ------------------------------------------------------------
    const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, hover: 0, thover: 0 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      ptr.tx = (e.clientX - r.left) / r.width;
      ptr.ty = 1 - (e.clientY - r.top) / r.height; // y-up, matches gl_FragCoord
      ptr.thover = 1;
    };
    const onLeave = () => {
      ptr.thover = 0;
      ptr.tx = 0.5;
      ptr.ty = 0.5;
    };
    if (pointer && !reduced) {
      canvas.addEventListener("pointermove", onMove, { passive: true });
      canvas.addEventListener("pointerleave", onLeave, { passive: true });
    }

    // ---- draw ---------------------------------------------------------------
    const draw = (t: number) => {
      if (!program) return;
      gl.useProgram(program);
      resize();
      gl.uniform2f(loc("uResolution")!, w, h);
      gl.uniform1f(loc("uTime")!, t);
      gl.uniform3f(loc("uPointer")!, ptr.x * w, ptr.y * h, ptr.hover);
      for (const [k, v] of Object.entries(live.current.uniforms ?? {})) {
        const l = loc(k);
        if (!l) continue;
        if (typeof v === "number") gl.uniform1f(l, v);
        else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);
        else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2]);
        else gl.uniform4f(l, v[0], v[1], v[2], v[3]);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    drawRef.current = draw;

    // ---- loop ---------------------------------------------------------------
    let raf = 0;
    let clock = 0; // accumulates only while actually rendering
    let last = 0;
    let visible = true;

    if (reduced) {
      ptr.hover = 0;
      draw(staticTime);
    } else {
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden || live.current.paused) {
          last = now;
          return;
        }
        // Clamp dt so returning to a backgrounded tab never fast-forwards.
        const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
        last = now;
        clock += dt * live.current.speed;
        ptr.x += (ptr.tx - ptr.x) * 0.12;
        ptr.y += (ptr.ty - ptr.y) * 0.12;
        ptr.hover += (ptr.thover - ptr.hover) * 0.08;
        draw(clock);
      };
      raf = requestAnimationFrame(frame);
    }

    // Suspend entirely while scrolled out of view — many shaders on one page
    // stay cheap because only the visible ones burn GPU.
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              visible = entries[0]?.isIntersecting ?? true;
              if (visible) last = 0;
            },
            { rootMargin: "120px" },
          )
        : null;
    io?.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (program) gl.deleteProgram(program);
      // Deliberately NOT calling WEBGL_lose_context here. A canvas returns the
      // same context object on every getContext call, so losing it would poison
      // every later mount on that canvas — React StrictMode re-runs effects in
      // dev, and any prop in the dependency list re-runs them in production.
      // The context is released when the canvas itself is collected.
    };
  }, [fragment, signature, speed, dpr, pointer, reduced, staticTime]);

  return { ref, supported };
}

/**
 * Parse `#rgb` / `#rrggbb` into a linear-ish 0..1 triple for shader uniforms.
 * Returns mid-grey for anything unparseable so a typo never blanks the canvas.
 */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [0.5, 0.5, 0.5];
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
