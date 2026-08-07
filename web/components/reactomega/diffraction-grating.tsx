"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface DiffractionGratingProps {
  className?: string;
  /** Groove spacing in nanometres. A CD is 1600, a DVD 740, embossed foil ~3200. @default 2450 */
  pitch?: number;
  /** How many spectral orders either side of the specular are kept. @default 3 */
  orders?: number;
  /** Resolving power, 0..1 — how saturated each spectral line stays. @default 0.72 */
  sharpness?: number;
  /** Colour of the metal under the grating. @default "#c9d8ff" */
  tint?: string;
}

/**
 * DiffractionGrating — the surface of a CD, or holographic foil: hard spectral
 * streaks that jump position as the light moves, not a soft pastel wash.
 *
 * The grooves run in concentric arcs and the eye sits at a finite distance, so
 * the view direction genuinely varies across the frame. From that geometry the
 * shader builds the grating path difference s = d·(sinθ_in + sinθ_out) by
 * projecting the light and view vectors onto the groove vector, and then simply
 * solves d·sinθ = mλ for the wavelength: order m sends λ = s/m to the eye at
 * this pixel, and nothing else. Solving for λ rather than integrating over a
 * handful of sampled wavelengths is what makes the streaks continuous — sampled
 * spectra bead into rows of coloured dots, because each sample resonates a few
 * pixels away from the last. Each order is therefore a smooth ramp through the
 * spectrum, cut off exactly where λ leaves the visible band. Because the pitch
 * is coarse the path difference climbs steeply across the frame, which is what
 * keeps each order a thin line rather than a wide band — sharp spectral lines
 * read as optics, wide soft ones read as decoration. The energy is weighted the
 * way a real grating weights it: the blaze falloff drops m=±2 to about a third of
 * m=±1 and m=±3 to a tenth, and `sharpness` — the resolving power mλ/Δλ —
 * additionally washes the high orders toward white, because the same physical
 * groove count buys less resolution across a wider order and neighbouring
 * wavelengths start overlapping at the eye. So the low orders are the saturated
 * ones and the high orders are dim *and* pale, instead of three equal rainbows.
 * Under all of it the substrate is a real surface, not a void: the pressed track
 * gives a fine band-limited ruling (sinc-filtered against the pixel footprint,
 * so it dissolves into its own mean rather than aliasing), a coarser sector
 * banding gives structure at a scale the eye can hold, and a broad dim specular
 * lobe squashed along the ruling supplies the oily sheen a disc carries
 * everywhere the rainbows are not. The zeroth order is achromatic and is kept
 * aside as a plain specular; the pointer takes the lamp, which walks the whole
 * spectrum across the disc.
 */
export function DiffractionGrating({
  className,
  pitch = 2450,
  orders = 3,
  sharpness = 0.72,
  tint = "#c9d8ff",
}: DiffractionGratingProps) {
  const uniforms = useMemo(
    () => ({
      uTint: hexToRgb(tint),
      uPitch: pitch,
      uOrders: orders,
      uSharp: sharpness,
    }),
    [tint, pitch, orders, sharpness],
  );

  const { ref, supported } = useShader({ speed: 1, uniforms, fragment: FRAG });

  if (!supported) {
    return (
      <div
        className={cn("h-full w-full", className)}
        aria-hidden
        style={{
          background: `repeating-linear-gradient(97deg, ${tint}12 0 2px, transparent 2px 4px), conic-gradient(from 214deg at 38% 62%, #0a0b12 0deg, #1b1836 26deg, #2d3a72 48deg, #3b6a6a 66deg, #6b6248 84deg, #5a2f42 104deg, #12131c 140deg, #0a0b12 360deg)`,
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

// A cosine convolved with the pixel footprint. The box filter of cos(2*pi*phi)
// over a width of w cycles is exactly sinc(w) = sin(pi*w)/(pi*w) — zero when the
// period reaches two pixels. The track structure below runs at three or four
// pixels a cycle and fans as it goes, so without this it would alias into
// crawling noise and take the spectra down with it.
float bandCos(float phi, float w) {
  float a = 1.0;
  if (w > 1e-4) a = clamp(sin(3.14159265 * w) / (3.14159265 * w), 0.0, 1.0);
  return cos(6.2831853 * phi) * a;
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Rough sRGB response to a single wavelength in nanometres. Sums of gaussians
// rather than a hue ramp, so the band order and the muddy cyan-green at 500nm
// come out where a real spectrum puts them.
vec3 spectral(float l) {
  vec3 c;
  c.r = 1.06 * exp(-pow((l - 604.0) / 56.0, 2.0))
      + 0.46 * exp(-pow((l - 700.0) / 54.0, 2.0))
      + 0.20 * exp(-pow((l - 432.0) / 26.0, 2.0));
  c.g = 1.02 * exp(-pow((l - 542.0) / 52.0, 2.0))
      + 0.34 * exp(-pow((l - 592.0) / 38.0, 2.0));
  c.b = 1.14 * exp(-pow((l - 452.0) / 42.0, 2.0))
      + 0.32 * exp(-pow((l - 484.0) / 38.0, 2.0));
  return c;
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;

  float t = uTime * 0.4;

  // Foil relief: an extremely shallow crinkle. The path difference is a
  // wavelength-scale quantity, so a normal that wanders even slightly shreds the
  // orders into contour noise. Almost all of the variation has to come from the
  // view geometry instead.
  float e = 0.020;
  float relief = vnoise(uv * 1.5 + vec2(t * 0.05, -t * 0.04));
  float rx = vnoise((uv + vec2(e, 0.0)) * 1.5 + vec2(t * 0.05, -t * 0.04));
  float ry = vnoise((uv + vec2(0.0, e)) * 1.5 + vec2(t * 0.05, -t * 0.04));
  vec3 N = normalize(vec3((relief - rx) * 0.055 / e, (relief - ry) * 0.055 / e, 1.0));

  // Grooves in concentric arcs about a centre well outside the frame: near
  // parallel, fanning slightly. That keeps the path difference monotonic across
  // the frame, which is the only way the orders separate into clean streaks.
  vec2 rad = uv - vec2(-3.1, -1.35);
  vec2 gDir = normalize(rad);
  float swirl = (vnoise(uv * 1.15 + 9.0) - 0.5) * 0.16;
  gDir = normalize(gDir + vec2(-gDir.y, gDir.x) * swirl);
  vec3 G = normalize(vec3(gDir, 0.0) - N * dot(N, vec3(gDir, 0.0)));

  // Track structure. The grooves that do the diffracting are a wavelength or two
  // apart — far below a pixel, and drawing them would only alias. What you
  // actually see on a disc is the coarser banding of the pressed track: hundreds
  // of grooves to a visible line. Concentric about the same centre as the
  // grating vector, because it is the same ruling, and band-limited because it
  // runs at three or four pixels a cycle and fans as it goes.
  float rl = length(rad);
  float gph = rl * 74.0 + 1.4 * vnoise(uv * 2.2 + 3.0);
  float groove = 0.5 + 0.5 * bandCos(gph, fwidth(gph));
  // A far coarser second banding — the pressed sectors — so the surface has
  // structure at a scale the eye can hold as well as one it can only resolve.
  float sect = 0.5 + 0.5 * bandCos(rl * 5.5 - 0.3, fwidth(rl * 5.5));

  // Finite eye distance: the view direction is what makes s position-dependent.
  vec3 V = normalize(vec3(-uv, 0.78));
  vec2 lxy = mix(vec2(0.30 + 0.55 * cos(t * 0.5 + 1.2), 0.34 * sin(t * 0.38)), pc, uPointer.z);
  vec3 L = normalize(vec3(lxy - uv, 0.62));

  // d * (sin(theta_in) + sin(theta_out)), both angles projected onto the groove
  // vector. This single scalar is the entire grating equation.
  float s = uPitch * (dot(V, G) + dot(L, G));

  float NdL = max(dot(N, L), 0.0);
  float atten = 1.0 / (1.0 + 1.2 * dot(uv - lxy, uv - lxy));

  // Rate of change of the path difference, in nanometres per pixel. It sets how
  // wide the band edges have to be feathered to stay smooth at any zoom.
  float ws = max(fwidth(s), 1e-4);
  float purity = clamp(uSharp, 0.0, 1.0);

  vec3 fan = vec3(0.0);
  for (int mi = 1; mi <= 4; mi++) {
    float mm = float(mi);
    if (mm > uOrders + 0.5) break;
    // The grating equation, solved for wavelength instead of for position.
    float lam = abs(s) / mm;
    float wl = ws / mm;
    // Order m only exists here if the wavelength it wants is one we can see.
    float band = smoothstep(0.0, 2.0 * wl + 5.0, lam - 398.0)
               * smoothstep(0.0, 2.0 * wl + 5.0, 712.0 - lam);
    // Blaze falloff: a real grating throws most of its energy into the low
    // orders, and steeply. Three equally bright bands is the single thing that
    // makes a grating read as a rainbow gradient instead of as optics.
    float eff = 1.0 / (1.0 + 2.2 * (mm - 1.0) * (mm - 1.0));
    // Finite resolving power R = mN. The *same* physical groove count buys less
    // resolution per unit wavelength as m rises relative to the width of the
    // order, so the high orders both dim and wash toward white — they overlap
    // themselves. Dimming alone would leave them fully saturated and still
    // reading as ribbon.
    float pur = purity / (1.0 + 0.90 * (mm - 1.0));
    vec3 sc = spectral(lam);
    sc = mix(vec3(dot(sc, vec3(0.32, 0.55, 0.13))) * 1.32, sc, 0.24 + 0.58 * pur);
    fan += sc * band * eff;
  }
  fan *= 1.18;

  // Zeroth order: ordinary mirror specular off the foil, plus the anisotropic
  // smear a grooved surface gives it along the groove direction.
  vec3 H = normalize(L + V);
  float NdH = max(dot(N, H), 0.0);
  float along = dot(H, G);
  float spec = pow(NdH, 900.0) * 1.6
             + pow(NdH, 90.0) * 0.10 * exp(-along * along * 14.0);

  // Dark polycarbonate over aluminium. The substrate has to read as a *surface*:
  // an empty black field between the orders is what left the earlier pass
  // looking like three neon ribbons floating on nothing, because a spectrum with
  // no object under it is just a gradient.
  vec3 base = uTint * (0.030 + 0.060 * NdL);
  base += uTint * 0.046 * pow(1.0 - abs(dot(V, N)), 2.4);
  // Broad low specular lobe. Very wide, very dim, anisotropically squashed along
  // the ruling: the oily sheen a disc carries everywhere the rainbows are not.
  // This single term is what the spectra end up sitting on.
  base += uTint * 0.38 * pow(NdH, 4.5) * (0.26 + 0.74 * exp(-along * along * 2.0)) * atten;
  base += uTint * 0.085 * exp(-along * along * 3.0) * atten;
  // The track modulates everything reflective, and hardest at grazing incidence
  // where the ridges shadow one another.
  base *= 0.70 + 0.56 * groove;
  // Structure at a scale the eye can actually hold, as well as one it can only
  // just resolve. With only the fine ruling, everywhere the spectra are not goes
  // back to being a flat field — which was the original complaint about the
  // substrate, and the fine banding alone does not answer it.
  base *= 0.84 + 0.30 * sect;
  base *= 0.90 + 0.22 * vnoise(uv * 1.3 + 17.0);
  base += uTint * 0.014 * sect * groove;

  vec3 col = base;
  // The spectra come off the ridges, so they carry the ruling too — faintly, or
  // the fine banding starts competing with the orders for attention.
  col += fan * mix(vec3(1.0), uTint, 0.18) * atten * (0.26 + 0.98 * NdL)
       * (0.82 + 0.26 * groove);
  col += vec3(1.0) * spec * atten * 0.42 * (0.62 + 0.52 * groove);
  // Faint second-surface haze so the black between orders is not empty.
  col += uTint * 0.024 * exp(-length(uv - lxy) * 1.6);

  col = 1.0 - exp(-col * 1.22);
  col *= 1.0 - 0.36 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
