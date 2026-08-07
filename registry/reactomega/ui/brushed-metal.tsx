"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface BrushedMetalProps {
  className?: string;
  /** `"linear"` for a straight-grain finish, `"radial"` for engine-turned. @default "linear" */
  pattern?: "linear" | "radial";
  /** How far the highlight is stretched across the grain, 0..1. @default 0.88 */
  anisotropy?: number;
  /** Base roughness of the polish, 0..1. @default 0.34 */
  roughness?: number;
  /** Colour the metal reflects. @default "#b9c8f0" */
  tint?: string;
  /** Speed the light orbits at. @default 1 */
  speed?: number;
}

/**
 * BrushedMetal — a still, machined surface. Nothing about the metal moves; only
 * the light does, and the highlight it drags is the entire subject.
 *
 * The grain is a direction field — constant for a linear finish, tangential
 * around the centre for an engine-turned one — and the abrasive scratches are
 * value noise sampled on coordinates stretched forty to one along that
 * direction, so every groove runs with the grain. Lighting is an anisotropic
 * GGX lobe: the roughness along the grain is held low while the roughness
 * across it is pushed up by `anisotropy`, and because a microfacet
 * distribution spreads reflections in the direction it is rough, the specular
 * comes out as a long streak lying *perpendicular* to the brushing. That
 * asymmetry is the whole tell of brushed metal, and it is computed rather than
 * drawn. Smith-correlated shadowing keeps the grazing rim from blowing out,
 * and the pointer takes the light over.
 */
export function BrushedMetal({
  className,
  pattern = "linear",
  anisotropy = 0.88,
  roughness = 0.34,
  tint = "#b9c8f0",
  speed = 1,
}: BrushedMetalProps) {
  const uniforms = useMemo(
    () => ({
      uTint: hexToRgb(tint),
      uRadial: pattern === "radial" ? 1 : 0,
      uAniso: anisotropy,
      uRough: roughness,
    }),
    [tint, pattern, anisotropy, roughness],
  );

  const { ref, supported } = useShader({ speed, uniforms, fragment: FRAG });

  if (!supported) {
    return (
      <div
        className={cn("h-full w-full", className)}
        aria-hidden
        style={{
          background: `linear-gradient(100deg, #0a0b12 0%, ${tint}66 34%, #0d1018 52%, ${tint}44 70%, #0a0b12 100%)`,
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

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Quintic, not cubic: the milling term is sampled at a low frequency, and
  // cubic value noise creases visibly along its lattice lines when it is.
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Scratch depth at a point already expressed in (along-grain, across-grain)
// coordinates. Three bands of abrasive grit, each stretched hard along the grain.
float grooves(vec2 g) {
  float v = vnoise(vec2(g.x * 0.9, g.y * 40.0)) - 0.5;
  v += 0.62 * (vnoise(vec2(g.x * 2.1 + 11.0, g.y * 130.0)) - 0.5);
  v += 0.34 * (vnoise(vec2(g.x * 4.3 - 7.0, g.y * 420.0)) - 0.5);
  return v;
}

// Anisotropic GGX. Rough across the grain, smooth along it — a microfacet lobe
// spreads light in whichever direction it is rough, so the highlight ends up
// lying across the brushing rather than with it.
float ggxAniso(vec3 H, vec3 T, vec3 B, vec3 N, float ax, float ay) {
  float ht = dot(H, T) / ax;
  float hb = dot(H, B) / ay;
  float hn = dot(H, N);
  float w = ht * ht + hb * hb + hn * hn;
  return 1.0 / (PI * ax * ay * w * w);
}

float smithG(vec3 V, vec3 T, vec3 B, vec3 N, float ax, float ay) {
  float vn = max(dot(V, N), 1e-4);
  float vt = dot(V, T) * ax;
  float vb = dot(V, B) * ay;
  float a2 = (vt * vt + vb * vb) / (vn * vn);
  return 2.0 / (1.0 + sqrt(1.0 + a2));
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;

  float t = uTime * 0.35;

  // Grain direction field. Radial mode is a turned finish, so the grain runs
  // tangentially and the grooves become concentric.
  vec2 rad = uv - vec2(0.06, -0.04);
  float rl = max(length(rad), 1e-4);
  vec2 tanDir = vec2(-rad.y, rad.x) / rl;
  vec2 lin = normalize(vec2(0.995, 0.100));
  vec2 Td = normalize(mix(lin, tanDir, uRadial));

  // A slow bow in the grain — dead-straight brushing reads as a CSS gradient.
  float bow = (vnoise(uv * vec2(1.4, 2.6) + 17.0) - 0.5) * 0.16 * (1.0 - uRadial);
  Td = normalize(Td + vec2(-Td.y, Td.x) * bow);
  vec2 Bd = vec2(-Td.y, Td.x);

  // Grain-local coordinates: x along the brush, y across it. For a turned finish
  // the brush runs *around* the centre, so the fast axis has to be the radius —
  // put the angle there instead and the grooves come out as radial spokes, which
  // is a completely different machining operation.
  // atan2 jumps by 2*pi across its branch cut, and since the angle is the
  // slow axis of the grain that jump prints a hard seam straight out from the
  // spindle. Folding to |theta| removes the discontinuity entirely; the mirror
  // it leaves along the other side is invisible because the noise varies barely
  // at all in that direction.
  vec2 g = mix(vec2(dot(uv, Td), dot(uv, Bd)),
               vec2(abs(atan(rad.y, rad.x)) * 1.35, rl * 0.85), uRadial);

  float e = 1.0 / m;
  float d = grooves(g);
  float dx = grooves(g + vec2(0.0, e * 0.8)) - d;
  // Only the across-grain derivative matters; a groove has no slope along itself.
  float amp = 0.16 + 0.85 * uRough;
  vec3 N = normalize(vec3(Bd * (-dx * amp / e) * 0.010, 1.0));

  // Broad milling undulation, so large areas catch light differently.
  float mill = (vnoise(g * vec2(1.6, 4.2) + 3.0) - 0.5)
             + 0.5 * (vnoise(g * vec2(3.7, 9.5) - 8.0) - 0.5);
  N = normalize(N + vec3(Bd * mill * 0.10, 0.0) + vec3(Td * mill * 0.03, 0.0));

  vec3 T3 = normalize(vec3(Td, 0.0) - N * dot(N, vec3(Td, 0.0)));
  vec3 B3 = normalize(cross(N, T3));
  vec3 V = normalize(vec3(-uv * 0.45, 1.0));

  // The light orbits until the pointer claims it.
  vec2 lp = mix(vec2(0.50 * cos(t * 0.9 + 0.6), 0.30 * sin(t * 0.7)), pc, uPointer.z);
  vec3 L = normalize(vec3(lp - uv, 0.95));
  vec3 H = normalize(L + V);

  float ax = max(0.010, uRough * uRough * (1.0 - 0.94 * uAniso));
  float ay = max(0.020, uRough * uRough * (1.0 + 7.0 * uAniso));

  float NdL = max(dot(N, L), 0.0);
  float NdV = max(dot(N, V), 1e-3);
  float D = ggxAniso(H, T3, B3, N, ax, ay);
  float G = smithG(L, T3, B3, N, ax, ay) * smithG(V, T3, B3, N, ax, ay);
  float F = 0.62 + 0.38 * pow(1.0 - max(dot(H, V), 0.0), 5.0);
  float spec = D * G * F * NdL / (4.0 * NdV);

  // Second, much broader lobe: real brushed metal shows a wide sheen band far
  // from the hot streak, and without it the plate looks like bare noise.
  float ax2 = ax * 6.0 + 0.06;
  float ay2 = min(1.0, ay * 2.2 + 0.30);
  float sheen = ggxAniso(H, T3, B3, N, ax2, ay2) * NdL * 0.14;

  // Falloff of the light itself, so the plate has a lit end and a dark end.
  float falloff = 1.0 / (1.0 + 2.6 * dot(uv - lp, uv - lp));

  // A cool overhead gradient standing in for the room, so the plate has a body
  // tone away from the streak. A milled part in a dark studio is not black.
  vec3 room = mix(vec3(0.014, 0.017, 0.030), vec3(0.070, 0.082, 0.130),
                  smoothstep(-0.5, 0.7, dot(N, normalize(vec3(0.1, 0.9, 0.35)))));

  // The spindle centre has no defined grain direction, so ease the anisotropy
  // out there rather than letting it converge into a bright knot.
  float hub = mix(1.0, smoothstep(0.005, 0.055, rl), uRadial);
  vec3 col = uTint * room;
  col += uTint * (0.010 + 0.085 * NdL) * falloff;
  col += uTint * clamp(spec, 0.0, 40.0) * 0.075 * falloff * hub;
  col += uTint * sheen * falloff * 2.1 * hub;
  col += vec3(1.0) * clamp(spec, 0.0, 40.0) * 0.022 * falloff * hub;

  // Anodised rim shade and a faint dirt in the grain valleys.
  col *= 1.0 - 0.20 * smoothstep(0.0, 0.6, -d);
  col = 1.0 - exp(-col * 1.55);
  col *= 1.0 - 0.46 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.014;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
