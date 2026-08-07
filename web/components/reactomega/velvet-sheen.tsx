"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface VelvetSheenProps {
  className?: string;
  /** Strength of the retroreflective sheen at grazing angles. @default 1 */
  sheen?: number;
  /** Amount of fibre disorder in the nap, 0..1. @default 0.62 */
  fuzz?: number;
  /** Dye colour of the pile. @default "#5b3fa8" */
  tint?: string;
  /** Colour the folds fall into. @default "#07070d" */
  shadow?: string;
}

/**
 * VelvetSheen — a bolt of velvet lying in soft folds, lit by its own nap rather
 * than by anything reflective.
 *
 * Fabric with a pile does not obey a normal specular model. Each fibre stands
 * roughly upright, so light arriving almost parallel to the cloth grazes the
 * whole length of the pile and scatters straight back, while light arriving
 * face-on disappears down between the fibres. The BRDF here is that inversion:
 * an Ashikhmin-style velvet distribution built on 1/(N·H)² over the fibre
 * tangent, gated by an *inverted* Fresnel — pow(1 - N·V, 4) — so the cloth is
 * brightest exactly where it turns away from you and darkest where it faces
 * you. Diffuse is wrapped around the terminator with a subsurface half-Lambert,
 * because dyed pile bleeds light sideways, and the fold flanks carry a fine
 * fuzz normal from stretched noise plus a per-fibre density variance that
 * scales the sheen. The result reads as textile because the highlight follows
 * the silhouette of every fold instead of sitting on top of it. The pointer
 * combs the nap.
 */
export function VelvetSheen({
  className,
  sheen = 1,
  fuzz = 0.62,
  tint = "#5b3fa8",
  shadow = "#07070d",
}: VelvetSheenProps) {
  const uniforms = useMemo(
    () => ({
      uTint: hexToRgb(tint),
      uShadow: hexToRgb(shadow),
      uSheen: sheen,
      uFuzz: fuzz,
    }),
    [tint, shadow, sheen, fuzz],
  );

  const { ref, supported } = useShader({ speed: 1, uniforms, fragment: FRAG });

  if (!supported) {
    return (
      <div
        className={cn("h-full w-full", className)}
        aria-hidden
        style={{
          background: `radial-gradient(140% 110% at 50% 120%, ${tint} 0%, ${shadow} 62%), linear-gradient(85deg, ${shadow} 0%, ${tint}99 40%, ${shadow} 100%)`,
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

float fbm(vec2 p) {
  float a = 0.5, v = 0.0;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    a *= 0.5;
  }
  return v;
}

// Height of the draped cloth. Long soft folds along one axis plus a slow FBM
// sag, so the folds gather and release the way heavy fabric does.
float cloth(vec2 p, float t) {
  // A bolt of cloth hangs in long parallel gathers. The noise only wanders the
  // phase and amplitude of those gathers — added to the height directly it turns
  // the drape into lumpy terrain, which is exactly what velvet never looks like.
  float ph = fbm(p * 0.30 + vec2(0.0, t * 0.035)) * 2.9;
  float amp = 0.72 + 0.60 * fbm(p * 0.26 + vec2(4.0, 1.0));
  float fold = sin(p.x * 3.05 + p.y * 0.42 + ph + t * 0.20)
             + 0.44 * sin(p.x * 5.70 - p.y * 0.26 + ph * 0.7 - t * 0.14);
  return fold * amp * 0.30;
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;

  float t = uTime * 0.45;
  vec2 p = uv * 2.6;

  float e = 0.014;
  float h = cloth(p, t);
  vec3 N = normalize(vec3((cloth(p - vec2(e, 0.0), t) - cloth(p + vec2(e, 0.0), t)) * 3.1,
                          (cloth(p - vec2(0.0, e), t) - cloth(p + vec2(0.0, e), t)) * 3.1,
                          e * 0.72));

  // Nap: fibres lie in ranks, so the disorder is stretched, not isotropic.
  vec2 nq = uv * vec2(150.0, 420.0);
  float f1 = vnoise(nq) - 0.5;
  float f2 = vnoise(nq * 2.7 + 31.0) - 0.5;
  vec3 fz = vec3(f1 * 1.0, f2 * 0.55, 0.0) * uFuzz * 0.16;
  // The pointer combs the pile flat, which locally kills the sheen.
  vec2 rel = uv - pc;
  float comb = uPointer.z * exp(-dot(rel, rel) * 10.0);
  vec3 Nf = normalize(N + fz - vec3(normalize(rel + 1e-5) * comb * 0.22, 0.0));

  // Per-fibre density variance. Velvet is never uniformly bright; this is what
  // separates cloth from a glowing outline.
  float dens = 0.70 + 0.36 * fbm(uv * 48.0 + 5.0) + 0.16 * (vnoise(uv * vec2(120.0, 340.0)) - 0.5);

  vec3 V = normalize(vec3(-uv * 0.55, 1.0));
  vec3 L = normalize(vec3(mix(vec2(-0.62, 0.30), pc, uPointer.z) - uv * 0.4, 0.50));
  vec3 H = normalize(L + V);

  float NdV = clamp(dot(Nf, V), 0.001, 1.0);
  float NdL = dot(Nf, L);
  float NdH = clamp(dot(Nf, H), 0.001, 1.0);

  // Wrapped diffuse. Pile scatters sideways, so the terminator bleeds well past
  // where a Lambert surface would already be black.
  float wrap = 0.42;
  float diff = clamp((NdL + wrap) / (1.0 + wrap), 0.0, 1.0);
  diff *= diff;

  // Ashikhmin velvet lobe over the fibre tangent, gated by an inverted Fresnel.
  // Both factors peak where the surface turns edge-on to the eye.
  float sinTH2 = max(0.0, 1.0 - NdH * NdH);
  float velvet = (sinTH2 * sinTH2) / (NdH * NdH * NdH * NdH + 1e-4);
  velvet = min(velvet, 9.0);
  float invFres = pow(1.0 - NdV, 5.0);
  float retro = pow(clamp(dot(-V, -L) * 0.5 + 0.5, 0.0, 1.0), 2.0);

  // Fibre-scale modulation of the sheen itself, not just of the normal: the pile
  // lies in ranks and the ranks glint separately. Without this the sheen bands
  // come out as smooth airbrushed gradients and lose the textile read entirely.
  float rank = 0.58 + 0.72 * vnoise(uv * vec2(210.0, 55.0) + 4.0)
                    + 0.26 * (vnoise(uv * vec2(38.0, 620.0)) - 0.5);
  float sheen = uSheen * dens * rank * max(NdL + 0.30, 0.0)
              * (0.055 * velvet * invFres + 1.15 * invFres * (0.28 + 0.72 * retro));

  // Ambient occlusion from the fold depth: the bottoms of the gathers go dark
  // even where they are turned toward the light.
  float ao = smoothstep(-0.42, 0.60, h) * 0.62 + 0.38;

  vec3 pileLo = uShadow + uTint * 0.085;
  vec3 body = mix(pileLo, uTint * 0.90, diff * ao);
  vec3 sheenCol = mix(uTint * 0.55 + vec3(0.30, 0.32, 0.42), vec3(0.72, 0.74, 0.86), 0.45);

  // The pile itself is held down hard. Velvet is a dark cloth; if the body is
  // bright the sheen has nothing to be brighter than and the fabric cue dies.
  vec3 col = body * (0.20 + 0.40 * ao);
  col += sheenCol * sheen * ao * 0.52;
  col += uTint * 0.10 * comb;

  col = 1.0 - exp(-col * 1.62);
  col *= 1.0 - 0.52 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.013;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
