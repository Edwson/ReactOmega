"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface MoireWeaveProps {
  className?: string;
  /** Lattice period in device pixels. Below about 2.5 the filter takes over. @default 8 */
  pitch?: number;
  /** Angle between the two lattices, in degrees. Small angles give huge fringes. @default 4.5 */
  angle?: number;
  /** `true` weaves the two thread sets over and under, `false` leaves flat line screens. @default true */
  weave?: boolean;
  /** Colour of the lit threads. @default "#a8bcff" */
  tint?: string;
}

/**
 * MoireWeave — two rigid high-frequency lattices laid over each other at a few
 * degrees, where the enormous soft fringes are interference between them and
 * not a pattern anyone drew.
 *
 * Each lattice is a pair of cosine thread screens with an exact phase, so the
 * beat visible across the frame is genuinely the difference frequency k1 - k2:
 * shrink the angle and the fringes grow without bound, which is the signature
 * of real moiré. The lattices sit on a slightly tilted plane, which means the
 * period measured in pixels compresses toward the top of the frame and runs
 * straight at the sampling limit — so every cosine is band-limited before it is
 * used. Each thread is convolved with the pixel footprint analytically, the box
 * filter of cos(2πφ) being sinc(w) with w = fwidth(φ) in cycles per pixel: the
 * amplitude decays to exactly zero as the period reaches two pixels and the
 * lattice dissolves into its own mean grey instead of boiling into noise. In
 * weave mode a third band-limited cosine on φ₁+φ₂ decides which thread set
 * passes over at each crossing. The pointer swells the local pitch.
 */
export function MoireWeave({
  className,
  pitch = 8,
  angle = 4.5,
  weave = true,
  tint = "#a8bcff",
}: MoireWeaveProps) {
  const uniforms = useMemo(
    () => ({
      uTint: hexToRgb(tint),
      uPitch: pitch,
      uAngle: angle,
      uWeave: weave ? 1 : 0,
    }),
    [tint, pitch, angle, weave],
  );

  const { ref, supported } = useShader({ speed: 1, uniforms, fragment: FRAG });

  if (!supported) {
    return (
      <div
        className={cn("h-full w-full", className)}
        aria-hidden
        style={{
          background: `repeating-linear-gradient(2deg, ${tint}22 0 3px, #06060a 3px 6px), repeating-linear-gradient(93deg, ${tint}18 0 3px, transparent 3px 6px), #06060a`,
        }}
      />
    );
  }

  return <canvas ref={ref} className={cn("block h-full w-full", className)} aria-hidden />;
}

const FRAG = /* glsl */ `
const float PI = 3.14159265;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// A cosine convolved with the pixel footprint. The box filter of cos(2*pi*phi)
// over a width of w cycles is exactly sinc(w) = sin(pi*w)/(pi*w) — zero when the
// period hits two pixels. This single line is the difference between moire and
// a screenful of crawling noise.
float bandCos(float phi, float w) {
  float a = 1.0;
  if (w > 1e-4) a = clamp(sin(PI * w) / (PI * w), 0.0, 1.0);
  return cos(2.0 * PI * phi) * a;
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;

  float t = uTime * 0.25;

  // A mild tilt away from the viewer. This is not decoration: it forces the
  // period in pixels to sweep through the whole range up to Nyquist, so the
  // filter is doing visible work in every frame.
  float z = 1.0 + 2.35 * (uv.y + 0.5);
  vec2 P = (gl_FragCoord.xy - 0.5 * uResolution) * z;

  // The pointer swells the local pitch — the fringes rearrange around it,
  // because a pitch change is a frequency change and the beat follows.
  vec2 rel = uv - pc;
  float swell = 1.0 - uPointer.z * 0.30 * exp(-dot(rel, rel) * 8.0);

  float f = 1.0 / max(2.0, uPitch * swell);
  // Only the relative angle is animated. The fringe scale goes as 1/angle, so a
  // half-degree drift is a very large change in what you see.
  float a1 = radians(-0.5 * uAngle + 1.1 * sin(t * 0.5)) + 0.06 * sin(t * 0.31);
  float a2 = radians(0.5 * uAngle + 1.1 * sin(t * 0.5 + 2.2)) + 0.06 * sin(t * 0.31);
  vec2 k1 = f * vec2(cos(a1), sin(a1));
  vec2 k2 = f * 1.008 * vec2(cos(a2), sin(a2));

  // Warp and weft of each lattice.
  float p1 = dot(P, k1);
  float q1 = dot(P, vec2(-k1.y, k1.x));
  float p2 = dot(P, k2);
  float q2 = dot(P, vec2(-k2.y, k2.x));

  float w1 = fwidth(p1), v1 = fwidth(q1);
  float w2 = fwidth(p2), v2 = fwidth(q2);

  float A = bandCos(p1, w1), Ab = bandCos(q1, v1);
  float B = bandCos(p2, w2), Bb = bandCos(q2, v2);

  // Over/under at each crossing, from a band-limited cosine on the sum phase.
  float ck1 = 0.5 + 0.5 * bandCos((p1 + q1) * 0.5, fwidth((p1 + q1) * 0.5));
  float ck2 = 0.5 + 0.5 * bandCos((p2 + q2) * 0.5, fwidth((p2 + q2) * 0.5));

  // Woven: the over/under decides which thread set is visible at each crossing.
  // Unwoven: plain single-direction line screens, which is the textbook pairing
  // and gives much cleaner fringes because only one frequency beats per lattice.
  float l1 = mix(0.5 + 0.5 * A, mix(0.5 + 0.5 * Ab, 0.5 + 0.5 * A, ck1), uWeave);
  float l2 = mix(0.5 + 0.5 * B, mix(0.5 + 0.5 * Bb, 0.5 + 0.5 * B, ck2), uWeave);

  // Superposition. Two overlaid screens multiply their transmittances; the beat
  // is emergent, and this is where it comes from.
  float sup = l1 * l2;

  // The same beat written out analytically at the difference frequency. Used
  // only as a lighting envelope, so the fringes still read once the lattices
  // themselves have been filtered away to grey near the horizon.
  vec2 kd = k1 - k2;
  float beat = 0.5 + 0.5 * bandCos(dot(P, kd), fwidth(dot(P, kd)));
  vec2 kd2 = k1 - vec2(-k2.y, k2.x);
  float beat2 = 0.5 + 0.5 * bandCos(dot(P, kd2), fwidth(dot(P, kd2)));
  float env = mix(beat, beat2, 0.42);

  // Thread shading: a cylindrical cross-section catches light off to one side,
  // which is what stops a woven surface looking like printed squares.
  float lit = 0.5 + 0.5 * bandCos(p1 - 0.22, w1);
  float lit2 = 0.5 + 0.5 * bandCos(q2 + 0.22, v2);

  vec3 warm = uTint;
  vec3 cool = vec3(0.09, 0.11, 0.30);

  vec3 col = vec3(0.012, 0.014, 0.028);
  col += mix(cool * 0.45, warm, smoothstep(0.06, 0.72, sup)) * (0.10 + 1.20 * pow(sup, 1.20));
  // Fringe lighting: crests of the beat get the specular, troughs go blue-black.
  col *= 0.24 + 1.50 * pow(env, 1.9);
  col += warm * pow(env, 4.0) * 0.42;
  col += vec3(0.85, 0.90, 1.0) * pow(sup, 3.4) * pow(env, 3.0) * 0.14;
  col += warm * 0.16 * lit * lit2 * env;

  // A broad key so the frame has a lit corner rather than uniform coverage.
  col *= 0.55 + 0.85 * exp(-length(uv - vec2(-0.30, 0.16)) * 1.5);

  col = 1.0 - exp(-col * 1.70);
  col *= 1.0 - 0.38 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
