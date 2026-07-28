"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface HalftoneGradientProps {
  className?: string;
  /** First gradient stop. @default "#7c5cff" */
  from?: string;
  /** Last gradient stop — the midpoint is derived from both. @default "#4fd1ff" */
  to?: string;
  /** Screen pitch in device pixels: dot spacing, or Bayer block size. @default 14 */
  dotSize?: number;
  /** Screen angle in degrees. Also sets the gradient direction. @default 22 */
  angle?: number;
  /** Drift speed of the gradient underneath the screen. @default 1 */
  speed?: number;
  /** Rotated dot screen, or an ordered 4x4 Bayer matrix. @default "dots" */
  mode?: "dots" | "bayer";
}

/**
 * HalftoneGradient — a drifting multi-stop gradient printed through a screen,
 * so it resolves into discrete ink rather than a smooth blend.
 *
 * The continuous field underneath is a directional ramp perturbed by three
 * detuned sines, run through a three-stop ramp (from → a lifted midpoint → to).
 * That field is then destroyed on purpose. In "dots" mode each channel gets its
 * own rotated dot screen 30° apart, exactly as CMY separations are angled in
 * print — the offset is what produces rosettes instead of a moiré clash — and
 * dot radius goes as √value so dot *area* stays linear in tone, which is why
 * mid-greys do not print muddy. In "bayer" mode a 4×4 ordered dither matrix
 * (computed arithmetically, no lookup table) biases a per-channel quantiser to
 * four levels, giving flat risograph plates with a visible weave. Antialiasing
 * is derived from the cell pitch rather than fwidth so cell seams stay clean.
 * The pointer shrinks the local pitch, opening the screen up under the cursor.
 */
export function HalftoneGradient({
  className,
  from = "#7c5cff",
  to = "#4fd1ff",
  dotSize = 14,
  angle = 22,
  speed = 1,
  mode = "dots",
}: HalftoneGradientProps) {
  const uniforms = useMemo(
    () => ({
      uFrom: hexToRgb(from),
      uTo: hexToRgb(to),
      uCell: dotSize,
      uAngle: (angle * Math.PI) / 180,
      uMode: mode === "bayer" ? 1 : 0,
    }),
    [from, to, dotSize, angle, mode],
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
        style={{
          background: `linear-gradient(${angle + 90}deg, ${from} 0%, ${to} 100%)`,
        }}
      />
    );
  }

  return <canvas ref={ref} className={cn("block h-full w-full", className)} aria-hidden />;
}

const FRAG = /* glsl */ `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 rot2(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// 2x2 then 4x4 ordered dither, built from the recursive definition instead of a
// table. Wrapped to 0..3 first so y*y never loses mantissa on tall buffers.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  a = mod(a, 4.0);
  return bayer2(a * 0.5) * 0.25 + bayer2(a);
}

// One rotated dot screen. Radius tracks sqrt(value) so covered *area* is linear
// in tone — the standard print correction.
float screen(vec2 frag, float cell, float ang, float value) {
  vec2 q = rot2(frag, ang) / cell;
  float d = length(fract(q) - 0.5);
  float rad = sqrt(clamp(value, 0.0, 1.0)) * 0.52;
  float aa = 1.4 / cell;
  return smoothstep(rad + aa, rad - aa, d);
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;
  float t = uTime;

  // Continuous field: a directional ramp with three detuned sines on top, so
  // the stops never sit still and never repeat cleanly.
  vec2 dir = vec2(cos(uAngle), sin(uAngle));
  float g = dot(uv, dir) * 1.15 + 0.5;
  g += 0.20 * sin(uv.y * 3.3 - t * 0.61)
     + 0.15 * sin(uv.x * 2.4 + t * 0.47)
     + 0.09 * sin((uv.x + uv.y) * 5.1 - t * 0.83);
  g = clamp(g, 0.0, 1.0);

  vec3 mid = clamp(mix(uFrom, uTo, 0.5) * 1.32 + 0.05, 0.0, 1.0);
  vec3 grad = mix(mix(uFrom, mid, clamp(g * 2.0, 0.0, 1.0)), uTo, clamp(g * 2.0 - 1.0, 0.0, 1.0));

  // Pointer opens the screen: finer pitch, a touch more ink.
  vec2 rel = uv - pc;
  float near = uPointer.z * exp(-dot(rel, rel) * 7.0);
  float cell = max(uCell * mix(1.0, 0.38, near), 2.0);

  float v = (0.20 + 0.88 * g) * (1.0 - 0.40 * dot(uv, uv)) + 0.20 * near;
  vec3 c = clamp(grad * v * 0.98, 0.0, 1.0);

  vec3 ink;
  if (uMode > 0.5) {
    float th = bayer4(floor(gl_FragCoord.xy / cell)) - 0.5;
    ink = floor(c * 4.0 + th + 0.5) * 0.25 * 0.95;
  } else {
    vec3 cov = vec3(screen(gl_FragCoord.xy, cell, uAngle + 0.2618, c.r),
                    screen(gl_FragCoord.xy, cell, uAngle + 0.7854, c.g),
                    screen(gl_FragCoord.xy, cell, uAngle + 1.3090, c.b));
    // Separated screens are what makes a rosette, but taken literally every dot
    // lands on a pure primary. Blending back toward shared coverage keeps the
    // interference pattern while the colour stays in the gradient.
    float shared = dot(cov, vec3(0.3333));
    ink = mix(cov, vec3(shared), 0.62) * grad * 1.02;
  }

  vec3 paper = uFrom * 0.035 + vec3(0.016, 0.016, 0.026);
  vec3 col = paper + ink;
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.010;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
