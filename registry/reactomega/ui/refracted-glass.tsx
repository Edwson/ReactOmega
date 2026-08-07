"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface RefractedGlassProps {
  className?: string;
  /** Optical depth of the slab — how far the bent ray travels before it exits. @default 0.34 */
  thickness?: number;
  /** Refractive index of the body. 1.5 is crown glass, 1.9 reads as sapphire. @default 1.52 */
  ior?: number;
  /** Spread between the red and blue indices. 0 is achromatic, 1 is showy. @default 1 */
  dispersion?: number;
  /** Width of the bevelled edge as a fraction of the panel, 0..1. @default 0.34 */
  bevel?: number;
  /** Absorption colour of the glass body. @default "#9fc0ff" */
  tint?: string;
}

/**
 * RefractedGlass — a thick bevelled slab of glass laid over a procedural
 * backdrop, refracting it rather than blurring it.
 *
 * The panel is a rounded-box SDF whose interior distance is lifted into a
 * circular fillet, so the surface normal swings from straight-up in the middle
 * to almost horizontal at the rim. The view ray is then refracted through that
 * normal with Snell's law — separately for three indices, red low and blue
 * high — and each channel samples the backdrop at its own exit point. Because
 * the three exit points only diverge where the normal is steep, dispersion
 * appears exactly where real glass shows it: hugging the bevel, absent across
 * the flat. A Schlick Fresnel term on the same normal lights the rim, the
 * fillet gathers a converging band of light a third of the way up its slope,
 * and the transmitted colour is attenuated by the body tint. The pointer
 * drags the reflected highlight across the panel.
 */
export function RefractedGlass({
  className,
  thickness = 0.34,
  ior = 1.52,
  dispersion = 1,
  bevel = 0.34,
  tint = "#9fc0ff",
}: RefractedGlassProps) {
  const uniforms = useMemo(
    () => ({
      uTint: hexToRgb(tint),
      uThickness: thickness,
      uIor: ior,
      uDispersion: dispersion,
      uBevel: bevel,
    }),
    [tint, thickness, ior, dispersion, bevel],
  );

  const { ref, supported } = useShader({ speed: 1, uniforms, fragment: FRAG });

  if (!supported) {
    return (
      <div
        className={cn("h-full w-full", className)}
        aria-hidden
        style={{
          background: `radial-gradient(120% 100% at 22% 18%, ${tint}44 0%, transparent 58%), linear-gradient(135deg, #06060a 0%, #141a30 50%, #06060a 100%)`,
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

// What the glass is sitting on. Deliberately built from soft blooms *and* hard
// diagonal bars: the blooms sell depth, but only an edge makes dispersion legible.
vec3 backdrop(vec2 q, float t) {
  vec3 c = vec3(0.016, 0.020, 0.042);
  c += vec3(0.26, 0.40, 0.92) * 0.62 * exp(-length((q - vec2(-0.52, 0.26)) * vec2(1.0, 1.25)) * 2.6);
  c += vec3(0.52, 0.30, 0.86) * 0.44 * exp(-length((q - vec2(0.54, -0.30)) * vec2(1.0, 1.3)) * 3.0);
  c += vec3(0.16, 0.52, 0.70) * 0.22 * exp(-length(q - vec2(0.10, 0.52)) * 3.4);
  float b = sin((q.x * 0.62 + q.y * 1.55) * 8.5 - t * 0.42);
  c += vec3(0.70, 0.80, 1.00) * 0.52 * smoothstep(0.86, 0.995, b);
  float b2 = sin((q.x * 1.30 - q.y * 0.70) * 5.0 + t * 0.28);
  c += vec3(0.34, 0.54, 1.00) * 0.30 * smoothstep(0.88, 1.00, b2);
  return c;
}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// Interior distance lifted into a quarter-circle fillet. sqrt(1-(1-k)^2) has an
// infinite slope at the rim, which is precisely what a real bevel does to a normal.
float slabHeight(vec2 p, float bw) {
  float k = clamp(-sdRoundBox(p, vec2(0.655, 0.352), 0.085) / bw, 0.0, 1.0);
  return sqrt(max(0.0, 1.0 - (1.0 - k) * (1.0 - k)));
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;

  float t = uTime;
  float bw = max(0.02, uBevel * 0.30);
  float sd = sdRoundBox(uv, vec2(0.655, 0.352), 0.085);

  if (sd > 0.0) {
    // Outside the panel: the raw backdrop, plus the shadow the slab casts and a
    // thin sliver of light leaking out along the ground contact.
    vec3 col = backdrop(uv, t) * (1.0 - 0.62 * exp(-sd * 7.0));
    col += uTint * 0.16 * exp(-sd * 60.0);
    col *= 1.0 - 0.40 * dot(uv, uv);
    col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;
    fragColor = vec4(max(col, 0.0), 1.0);
    return;
  }

  float e = 1.6 / m;
  float h = slabHeight(uv, bw);
  vec3 N = normalize(vec3((slabHeight(uv - vec2(e, 0.0), bw) - slabHeight(uv + vec2(e, 0.0), bw)) * 0.42,
                          (slabHeight(uv - vec2(0.0, e), bw) - slabHeight(uv + vec2(0.0, e), bw)) * 0.42,
                          e));

  vec3 I = vec3(0.0, 0.0, -1.0);
  float d0 = uDispersion * 0.125;
  // Cauchy ordering: blue is bent hardest, so the blue fringe always lands
  // further in from the rim than the red one.
  float travel = uThickness * (0.70 + 0.30 * h);
  vec2 oR = vec2(0.0), oG = vec2(0.0), oB = vec2(0.0);
  vec3 tR = refract(I, N, 1.0 / max(1.02, uIor - d0));
  vec3 tG = refract(I, N, 1.0 / max(1.02, uIor));
  vec3 tB = refract(I, N, 1.0 / max(1.02, uIor + d0));
  if (tR.z < -0.02) oR = tR.xy * (travel / -tR.z);
  if (tG.z < -0.02) oG = tG.xy * (travel / -tG.z);
  if (tB.z < -0.02) oB = tB.xy * (travel / -tB.z);

  // Two taps per channel a little apart along the refraction direction: the
  // cheapest thing that reads as "solid glass" rather than "a warped picture".
  float frost = 0.006 + 0.030 * (1.0 - h);
  vec3 s0 = vec3(backdrop(uv + oR, t).r, backdrop(uv + oG, t).g, backdrop(uv + oB, t).b);
  vec3 s1 = vec3(backdrop(uv + oR * 1.22 + frost, t).r,
                 backdrop(uv + oG * 1.22 - frost, t).g,
                 backdrop(uv + oB * 1.22 + frost * 0.5, t).b);
  vec3 through = mix(s0, s1, 0.34);

  // Beer-Lambert through the body: thick glass is not just darker, it is tinted.
  through *= exp(-(1.0 - uTint) * travel * 2.1);

  float cosI = clamp(N.z, 0.0, 1.0);
  float F = 0.055 + 0.945 * pow(1.0 - cosI, 5.0);

  // Reflected environment: a vertical sky ramp is enough, because the only
  // place the reflection vector swings far off axis is on the bevel anyway.
  vec3 R = reflect(I, N);
  vec3 env = mix(vec3(0.05, 0.06, 0.11), vec3(0.42, 0.54, 0.86), smoothstep(-0.6, 0.9, R.y))
           + vec3(0.30, 0.34, 0.50) * smoothstep(0.2, 1.0, -R.x) * 0.5;

  vec3 Lp = vec3(mix(vec2(-0.46, 0.40), pc, uPointer.z), 0.85);
  vec3 L = normalize(Lp - vec3(uv, h * uThickness));
  float spec = pow(max(dot(R, L), 0.0), 46.0) * 1.5 + pow(max(dot(R, L), 0.0), 6.0) * 0.14;

  vec3 col = mix(through, env, F) + spec * (0.5 + 0.5 * uTint);

  // The fillet is a lens; a third of the way up its slope the rays it turns all
  // pile into one band. That band is what makes a bevel look expensive.
  float k = clamp(-sd / bw, 0.0, 1.0);
  float conv = exp(-pow((k - 0.30) / 0.13, 2.0)) * (1.0 - 0.55 * abs(uv.y) / 0.36);
  col += uTint * conv * 0.30;
  col += vec3(1.0) * exp(-pow((k - 0.06) / 0.05, 2.0)) * 0.085;

  // Interior sheen so the flat centre is not dead: a very broad grazing term.
  col += uTint * 0.05 * pow(1.0 - cosI, 1.6);

  col = 1.0 - exp(-col * 1.34);
  col *= 1.0 - 0.30 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
