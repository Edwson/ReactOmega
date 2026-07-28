"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface CausticsProps {
  className?: string;
  /** Colour of the focused light. @default "#a9c4ff" */
  color?: string;
  /** Colour of the unlit floor. @default "#06060a" */
  background?: string;
  /** Brightness of the filaments. @default 1 */
  intensity?: number;
  /** Zoom of the caustic web — higher packs more cells in. @default 1.35 */
  scale?: number;
  /** Speed of the water above. @default 1 */
  speed?: number;
}

/**
 * Caustics — the net of focused light that a rippling water surface throws onto
 * the floor beneath it.
 *
 * Built the way caustics are actually cheap to fake: a coordinate is folded
 * back on itself five times, each pass displacing it by sines and cosines of
 * its own components at a different temporal rate, and each pass accumulates
 * the reciprocal distance to that folded position. Summing inverse distances
 * is what concentrates energy into thin bright filaments where many folds
 * happen to land together — the same reason real caustics are the envelope of
 * refracted rays. The accumulation is then gamma-crushed hard so the mid-tones
 * fall away and only the focus lines survive, and the crush exponent differs
 * slightly per channel so the filaments carry a faint prismatic edge. The
 * pointer drops a decaying radial phase wave into the surface, which bends the
 * web outward around the cursor.
 */
export function Caustics({
  className,
  color = "#a9c4ff",
  background = "#06060a",
  intensity = 1,
  scale = 1.35,
  speed = 1,
}: CausticsProps) {
  const uniforms = useMemo(
    () => ({
      uColor: hexToRgb(color),
      uBg: hexToRgb(background),
      uIntensity: intensity,
      uScale: scale,
    }),
    [color, background, intensity, scale],
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
          background: `radial-gradient(90% 70% at 50% 30%, ${color}33 0%, transparent 60%), ${background}`,
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

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;

  float t = uTime * 0.42 + 23.0;
  // The fold works on a large offset coordinate — at small |p| the reciprocal
  // distance saturates on every pass and the field flattens to a single tone.
  vec2 p = uv * uScale * 6.2831853 - 250.0;

  // A stone in the water above: a radial phase wave that displaces the sample
  // point, so the whole web refracts outward from the cursor rather than just
  // getting brighter under it.
  vec2 rel = uv - pc;
  float r = length(rel);
  float ripple = uPointer.z * sin(r * 24.0 - uTime * 4.6) * exp(-r * 4.5) * 0.85;
  p += normalize(rel + 1e-5) * ripple;

  // Fold the coordinate into itself; accumulate inverse distance each pass.
  vec2 q = p;
  float c = 1.0;
  const float INTEN = 0.0045;
  for (int n = 0; n < 5; n++) {
    float tn = t * (1.0 - (3.2 / float(n + 1)));
    q = p + vec2(cos(tn - q.x) + sin(tn + q.y), sin(tn - q.y) + cos(tn + q.x));
    float sx = sin(q.x + tn) / INTEN;
    float sy = cos(q.y + tn) / INTEN;
    c += 1.0 / length(vec2(p.x / (sx + 1e-4), p.y / (sy + 1e-4)));
  }
  c = 1.16 - pow(c / 5.0, 1.42);
  // Clamp before the gamma crush: c is an unbounded reciprocal-distance sum,
  // and pow(a, 7.9) on anything above 1.0 runs away to pure white.
  float a = clamp(abs(c), 0.0, 1.0);

  // Slightly different crush per channel: blue filaments end up marginally
  // wider than red, which reads as dispersion along every focus line.
  vec3 web = vec3(pow(a, 9.4), pow(a, 8.6), pow(a, 7.6)) * uIntensity;

  vec3 col = uBg + uColor * web * 1.45;
  col += uColor * 0.07 * pow(a, 3.4) * uIntensity;   // the broad underwater wash
  col += uColor * uPointer.z * 0.15 * exp(-r * 5.5); // glow where the stone fell

  col = 1.0 - exp(-col * 1.9);          // tone map — filaments stay bright, nothing clips
  col *= 1.0 - 0.34 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
