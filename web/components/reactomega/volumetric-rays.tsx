"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface VolumetricRaysProps {
  className?: string;
  /** Colour of the light. @default "#b9c6ff" */
  color?: string;
  /** Samples along each ray — quality, not brightness. @default 34 */
  rays?: number;
  /** Falloff per unit distance along the ray, 0..1. @default 0.94 */
  decay?: number;
  /** Overall gain on the scattering integral. @default 0.42 */
  exposure?: number;
  /** Drift speed of the occluding haze. @default 1 */
  speed?: number;
}

/**
 * VolumetricRays — light shafts breaking through drifting haze, with the source
 * pinned to the pointer.
 *
 * This is the radial light-scattering integral, the same one used as a
 * post-process in real-time renderers. From each pixel the shader steps back
 * toward the light in a straight line; at every step it evaluates the light
 * that would arrive there — a bright falloff around the source, multiplied by
 * how much of it a two-octave drifting noise field lets past — and adds it in,
 * attenuated by a factor that compounds each step. Because every pixel marches
 * along its own line to the same origin, near-source brightness gets smeared
 * radially outward and the silhouette of the haze becomes the shaft. Decay is
 * raised to a per-step power derived from the sample count, so raising `rays`
 * refines the integral instead of dimming the frame.
 */
export function VolumetricRays({
  className,
  color = "#b9c6ff",
  rays = 34,
  decay = 0.94,
  exposure = 0.42,
  speed = 1,
}: VolumetricRaysProps) {
  const uniforms = useMemo(
    () => ({
      uColor: hexToRgb(color),
      uRays: rays,
      uDecay: decay,
      uExposure: exposure,
    }),
    [color, rays, decay, exposure],
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
          background: `radial-gradient(70% 55% at 50% 22%, ${color} 0%, ${color}55 18%, transparent 62%), #06060a`,
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

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// The haze the light has to get through. Deliberately only two octaves — the
// march itself integrates them into structure, so paying for more is wasted.
float haze(vec2 p, float t) {
  float n = vnoise(p * 3.4 + vec2(t * 0.22, -t * 0.13));
  n += 0.5 * vnoise(p * 7.7 - vec2(t * 0.17, t * 0.28));
  // Hard-ish edges on purpose: a soft occluder integrates into fog, and what
  // makes a shaft legible is the sharp boundary between lit and blocked.
  return smoothstep(0.40, 0.64, n / 1.5);
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;
  float t = uTime;

  // Light sits high and centred until the pointer takes it over.
  vec2 lp = mix(vec2(0.0, 0.30), pc, uPointer.z);

  float samples = clamp(uRays, 8.0, 64.0);
  vec2 delta = (uv - lp) / samples * 0.94;
  vec2 pos = uv;
  float illum = 1.0;
  float sum = 0.0;

  // Decay is per unit distance, not per step, so sample count is pure quality.
  float dec = pow(clamp(uDecay, 0.60, 0.999), 32.0 / samples);

  for (int i = 0; i < 64; i++) {
    if (float(i) >= samples) break;
    pos -= delta;
    float src = exp(-length(pos - lp) * 2.6);
    sum += src * (1.0 - haze(pos * 3.1, t)) * illum;
    illum *= dec;
  }
  sum = sum / samples * uExposure * 5.6;   // mean along the ray, not the total

  float dl = length(uv - lp);
  vec3 col = uColor * 0.012;
  col += uColor * sum * exp(-dl * 0.75);
  col += uColor * 0.09 * exp(-dl * 2.4);   // soft bloom
  col += uColor * 0.45 * exp(-dl * 8.0);   // the source itself

  col = 1.0 - exp(-col * 1.15);            // tone map — the source glows without clipping
  col *= 1.0 - 0.30 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
