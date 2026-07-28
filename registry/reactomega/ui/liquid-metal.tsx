"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface LiquidMetalProps {
  className?: string;
  /** Highlight tint of the polished surface. @default "#c9d4ff" */
  tint?: string;
  /** Colour in the troughs. @default "#0a0b14" */
  shadow?: string;
  /** Zoom of the flow pattern — higher is busier. @default 1.5 */
  scale?: number;
  /** Flow speed multiplier. @default 1 */
  speed?: number;
  /** Number of polish bands swept across the surface. @default 5 */
  bands?: number;
  /** How hard the pointer pushes into the metal, 0..1. @default 0.6 */
  push?: number;
}

/**
 * LiquidMetal — a molten chrome surface that flows, catches light and dents
 * away from the pointer.
 *
 * The height field is two rounds of domain-warped value-noise FBM; the surface
 * normal is taken from finite differences of that field each frame, then lit
 * with a diffuse term, a tight specular, and a swept band pattern derived from
 * the normal — which is what reads as *polished* rather than merely bumpy.
 * Runs on raw WebGL2 with no dependencies, and settles into a single still
 * frame for reduced-motion users.
 */
export function LiquidMetal({
  className,
  tint = "#c9d4ff",
  shadow = "#0a0b14",
  scale = 1.5,
  speed = 1,
  bands = 5,
  push = 0.6,
}: LiquidMetalProps) {
  const uniforms = useMemo(
    () => ({
      uTint: hexToRgb(tint),
      uShadow: hexToRgb(shadow),
      uScale: scale,
      uBands: bands,
      uPush: push,
    }),
    [tint, shadow, scale, bands, push],
  );

  const { ref, supported } = useShader({
    speed,
    uniforms,
    fragment: FRAG,
  });

  if (!supported) {
    return (
      <div
        className={cn("h-full w-full", className)}
        aria-hidden
        style={{ background: `linear-gradient(135deg, ${shadow} 0%, ${tint} 48%, ${shadow} 100%)` }}
      />
    );
  }

  return <canvas ref={ref} className={cn("block h-full w-full", className)} aria-hidden />;
}

const FRAG = /* glsl */ `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float a = 0.5;
  float v = 0.0;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    a *= 0.5;
  }
  return v;
}

// Two rounds of domain warping — the second warp is what gives the metal its
// stretched, poured look instead of generic cloud noise.
float field(vec2 p, float t) {
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.20)), fbm(p + vec2(5.2, 1.3)));
  vec2 r = vec2(fbm(p + 2.1 * q + vec2(1.7, 9.2) - t * 0.15),
                fbm(p + 2.1 * q + vec2(8.3, 2.8) + t * 0.12));
  return fbm(p + 1.7 * r);
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;

  // Pointer dents the surface: push the sample point radially away from it.
  vec2 away = uv - pc;
  float d2 = dot(away, away);
  float dent = uPointer.z * uPush * exp(-d2 * 7.0);
  vec2 p = uv * uScale + normalize(away + 1e-5) * dent;

  float t = uTime * 0.4;
  // Wide finite-difference stencil on purpose: sampling the noise too tightly
  // returns per-pixel normals, which read as grey static rather than poured metal.
  float e = 0.030;
  float h = field(p, t);
  vec3 n = normalize(vec3(field(p + vec2(e, 0.0), t) - h, field(p + vec2(0.0, e), t) - h, 0.09));

  vec3 L = normalize(vec3(0.45, 0.72, 0.62));
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 42.0);

  // Swept polish bands read off the normal, not the height — this is the
  // difference between "chrome" and "grey clouds".
  float sweep = 0.5 + 0.5 * sin(n.x * uBands * 1.1 + n.y * uBands * 0.8 + h * uBands * 0.7 - t * 0.9);
  vec3 base = mix(uShadow, uTint, smoothstep(0.10, 0.95, sweep));

  vec3 col = base * (0.30 + 0.90 * diff) + spec * 1.35;
  col += (uPointer.z * 0.10) * exp(-d2 * 9.0) * uTint;

  // Dither out 8-bit banding in the dark falloff.
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;
  col *= 1.0 - 0.55 * dot(uv, uv);

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
