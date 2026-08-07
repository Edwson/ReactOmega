"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface TranslucentWaxProps {
  className?: string;
  /** Depth of the slab. Thicker material lets less of the backlight through. @default 1 */
  thickness?: number;
  /** Width of the forward-scattering lobe and how far light bleeds sideways. @default 1 */
  scatter?: number;
  /** Colour the material transmits — what survives the absorption. @default "#f7d2a8" */
  tint?: string;
  /** Beer-Lambert extinction coefficient. Higher goes waxy, lower goes glassy. @default 2.45 */
  absorption?: number;
  /** Width of the ground edge as a fraction of the slab, 0..1. @default 0.52 */
  bevel?: number;
}

/**
 * TranslucentWax — a ground slab of backlit alabaster, honey onyx cut thin
 * enough to pass light. Almost everything you see has been through the material
 * rather than off it.
 *
 * The body is a rounded-rectangle slab with a wide ground edge, and that
 * boundary is doing most of the work: a translucent solid is legible only by the
 * contrast between a glowing thin rim and a choked interior, so the form has to
 * be one whose thickness varies in a way the eye can read as a shape. A blob
 * cannot do that — its silhouette carries no information — whereas a slab says
 * "large through the middle, small at the edge" before any light is traced. The
 * ground edge is deliberately wide and its depth ramp very nearly linear, like a
 * chamfer rather than a fillet: a fillet reaches full depth within a few pixels
 * of the silhouette, so the pale rim exists but is too narrow to see and the slab
 * collapses back into one flat sheet with a hot outline. For
 * every pixel the shader marches the real light path, fourteen steps from the
 * front surface toward the source, accumulating the distance that stays between
 * the slab's lower and upper skins. Beer-Lambert then attenuates each channel by
 * exp(-σ·d), with σ taken as the complement of the tint and modulated by a
 * banded strata field, so the ground edge passes a pale cream and the centre
 * chokes down through amber to a deep ember, in that order, for the same reason
 * real onyx does. The veining is banded along the slab rather than isotropic:
 * strata read as stone, wandering noise reads as putty. A wrapped half-Lambert
 * against the back face lets the terminator bleed around the edge roll, and a
 * forward-scattering lobe blooms where the lamp sits directly behind a thin
 * section. Front lighting is deliberately almost absent: a little polish
 * specular, nothing more. The lamp is behind the stone and follows the pointer.
 */
export function TranslucentWax({
  className,
  thickness = 1,
  scatter = 1,
  tint = "#f7d2a8",
  absorption = 2.45,
  bevel = 0.52,
}: TranslucentWaxProps) {
  const uniforms = useMemo(
    () => ({
      uTint: hexToRgb(tint),
      uThickness: thickness,
      uScatter: scatter,
      uAbsorb: absorption,
      uBevel: bevel,
    }),
    [tint, thickness, scatter, absorption, bevel],
  );

  const { ref, supported } = useShader({ speed: 1, uniforms, fragment: FRAG });

  if (!supported) {
    return (
      <div
        className={cn("h-full w-full", className)}
        aria-hidden
        style={{
          background: `radial-gradient(64% 82% at 50% 50%, #3a1408 0%, #7a3410 34%, #b8681f 58%, ${tint} 76%, #2a1408 88%, #06060a 100%)`,
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

// Quintic interpolant rather than the usual smoothstep. The occupancy field is
// integrated along a light path, and cubic value noise has a discontinuous
// second derivative at every lattice line — which shows up in the transmission
// as faint polygonal creases across the stone.
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
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

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float smax(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
  return mix(b, a, h) + k * h * (1.0 - h);
}

// The same field, but with the interior corner rounded. A box distance field has
// a gradient discontinuity along each diagonal, and because the ground edge here
// is wide those four creases run a long way in and meet near the middle — the
// depth field's own medial axis, printed across the slab as an envelope-flap X.
// Softening only the interior branch removes them without moving the silhouette:
// the outer branch, length(max(q,0)), is what sets the boundary and is untouched,
// and the k/4 bias smax adds along the diagonal is subtracted straight back off.
float sdSlabSoft(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  const float K = 0.13;
  return min(smax(q.x, q.y, K) - 0.25 * K, 0.0) + length(max(q, 0.0)) - r;
}

const vec2 SLAB = vec2(0.575, 0.325);
const float SLAB_R = 0.115;
// A few degrees off axis. A slab squared to the frame reads as a UI panel; the
// same slab tilted reads as an object that was placed there.
const mat2 TILT = mat2(0.99255, -0.12187, 0.12187, 0.99255);

// Bedding planes. The band coordinate runs across the short axis of the slab and
// is warped by a stretched fbm — anisotropic on purpose, because the whole point
// is that the layers stay layers. Isotropic noise here is what made the earlier
// pass read as putty rather than as a cut stone.
float strata(vec2 sp, float t) {
  vec2 w = sp * vec2(0.9, 2.3) + vec2(t * 0.055, 0.0);
  float warp = fbm(w) - 0.5;
  float u = sp.y * 7.6 + sp.x * 1.30 + warp * 2.0;
  float band = 0.82 + 0.30 * sin(u * 2.1) + 0.17 * sin(u * 5.3 + 1.7) + 0.09 * sin(u * 11.0);
  // Fine grain on top, small enough that it never competes with the banding.
  band += 0.10 * (fbm(sp * 7.0 + 11.0) - 0.5);
  return max(band, 0.28);
}

// Interior fraction of the slab: 0 outside, 1 across the flat. The ground edge
// is where it ramps, and how wide that ramp is decides how much glowing rim
// there is to look at.
float slabK(vec2 sp, float bw) {
  return max(-sdSlabSoft(sp, SLAB, SLAB_R), 0.0) / bw;
}

// Cross-section against interior fraction. This is the single most important
// number in the file, because the *width of the thickness ramp* is what the eye
// reads as "light is coming through a solid thing". A circular fillet, or any
// power below 1, reaches full depth within a few pixels of the silhouette: the
// pale rim then exists but is two pixels wide, and the slab reads as one flat
// sheet of amber with a hot outline. A chamfer — depth rising very nearly
// linearly across a wide ground edge — spreads the whole pale-to-amber-to-ember
// ramp over sixty pixels, which is the only reason the gradient is legible.
//
// It saturates exponentially instead of being clamped. A clamp at full depth
// puts a kink in the depth field along the whole locus where it first bites, and
// because the normal is a difference of this function that kink prints as a hard
// rectangle drawn inside the slab — the plateau's own outline, which is not a
// feature of any real stone.
float profile(float x) {
  return 1.0 - exp(-1.6 * pow(x, 1.15));
}

// Half-depth of the slab at this point, including a little relief in the
// bedding so the interior thickness is not perfectly constant. The relief is
// banded for the same reason the absorption is.
float halfDepth(vec2 sp, float t, float bw) {
  float prof = profile(slabK(sp, bw));
  float lay = 0.5 + 0.5 * sin(sp.y * 7.4 + 1.9 * (fbm(sp * vec2(0.8, 2.0) + 4.0) - 0.5) * 3.0);
  return prof * (0.90 + 0.10 * lay);
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;

  float t = uTime * 0.5;
  vec2 sp = TILT * uv;
  float bw = max(0.03, uBevel * 0.30);

  float sd = sdRoundBox(sp, SLAB, SLAB_R);
  float k = slabK(sp, bw);
  float hd = halfDepth(sp, t, bw);
  float top = 0.55 * uThickness * hd;

  // The lamp is behind the slab and drifts; the pointer takes it over. Kept well
  // off centre: a lamp behind the middle lights the slab radially, and radial
  // symmetry is what makes backlit things look like lamps instead of like stone
  // on a light box.
  vec2 lxy = mix(vec2(-0.30 + 0.44 * cos(t * 0.80), 0.24 * sin(t * 0.63 + 1.0)), pc, uPointer.z);
  vec3 Lpos = vec3(lxy, -1.45 * uThickness);

  if (sd > 0.0) {
    // Off the slab: the dark table, the lamp bleeding round the silhouette, and
    // a warm contact line hugging the edge.
    vec3 col = vec3(0.014, 0.013, 0.017);
    col += uTint * 0.022 * exp(-length(uv - lxy) * 1.5);
    col += mix(uTint, vec3(1.0), 0.30) * 0.30 * exp(-sd * 26.0);
    col += uTint * 0.10 * exp(-sd * 7.0) * (0.35 + 0.65 * exp(-length(uv - lxy) * 1.2));
    col *= 1.0 - 0.42 * dot(uv, uv);
    col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;
    fragColor = vec4(max(col, 0.0), 1.0);
    return;
  }

  float e = 1.7 / m;
  vec3 N = normalize(vec3((halfDepth(sp - vec2(e, 0.0), t, bw) - halfDepth(sp + vec2(e, 0.0), t, bw)) * 0.55,
                          (halfDepth(sp - vec2(0.0, e), t, bw) - halfDepth(sp + vec2(0.0, e), t, bw)) * 0.55,
                          e));

  vec3 Pw = vec3(uv, top);
  vec3 L = normalize(Lpos - Pw);

  // March the real light path and measure how much of it lies inside the body.
  // This is the whole point: thickness is measured, not inferred from a normal.
  // Step length scaled to the local slab depth, not to a fixed worst case. With
  // a constant span the jittered steps are enormous compared with the thickness
  // of the ground edge, so the thin rim comes out as salt-and-pepper noise
  // instead of a gradient. The small constant term lets a ray leaving a thin
  // region still reach the thicker material next to it.
  float span = (1.05 * uThickness * hd + 0.18 * uThickness) / max(0.20, -L.z);
  float ds = span / 14.0;
  float dist = 0.0;
  // Start each pixel's march at a different fraction of a step. Fourteen steps
  // on a lock-step grid quantise the thickness and print terraces straight into
  // the transmission; jittering the phase turns that into noise the dither hides.
  vec3 q = Pw + L * ds * hash(gl_FragCoord.xy * 1.37);
  for (int i = 0; i < 14; i++) {
    float qh = halfDepth(TILT * q.xy, t, bw);
    if (q.z < -0.55 * uThickness * qh) break;
    if (q.z < 0.55 * uThickness * qh) dist += ds;
    q += L * ds;
  }
  // Floor on the optical depth. exp(-sigma*0) is 1 in every channel, so a path
  // length that reaches zero at the silhouette transmits the lamp unchanged and
  // rings the whole slab in white. Physically the light still has to cross the
  // scattering skin, and one pixel spans a range of depths anyway.
  dist = max(dist, 0.070 * uThickness);

  // Strata modulate the extinction coefficient, not the colour, so the bedding
  // only shows where there is enough material for it to matter — which is why
  // the layers fade out as they run into the ground edge, exactly as in a real
  // cut slab.
  float vein = strata(sp, t);
  vec3 sigma = (1.0 - uTint * 0.94) * uAbsorb * 6.0 * vein;
  vec3 trans = exp(-sigma * dist);

  // Wrapped diffuse against the back face — a half-Lambert with a wide wrap, so
  // the terminator bleeds around the edge roll the way scattering media do.
  float wrap = 0.55 * uScatter;
  float back = clamp((dot(-N, L) + wrap) / (1.0 + wrap), 0.0, 1.0);
  back *= back;

  // Forward scattering: light that keeps roughly its original direction after a
  // few bounces, so thin sections right in front of the lamp glow out.
  vec3 V = normalize(vec3(-uv * 0.6, 1.0));
  vec3 Lt = normalize(L + N * (0.30 * uScatter));
  float fd = clamp(dot(V, -Lt), 0.0, 1.0);
  float fwd = pow(fd, 3.0 / uScatter) * 1.4 + pow(fd, 14.0) * 1.0;

  float atten = 1.0 / (1.0 + 0.55 * dot(Lpos.xy - uv, Lpos.xy - uv));

  // Deep transmission shifts as well as darkens: an absorbing medium walks the
  // hue, and in warm stone the last thing to survive is the red. Multiple
  // scattering gives that floor a much longer tail than the ballistic term, so
  // it gets the same sigma over a heavily shortened effective path rather than a
  // constant — a constant floor is what made the first pass go *brighter* toward
  // the middle, since nothing then attenuated with thickness at all.
  // Diffusion is not a free pass: the multiply-scattered floor keeps losing
  // energy too, so it gets its own extinction — mostly achromatic, because a
  // random walk averages the channels, plus a share of the spectral sigma to
  // keep the hue walking red. Giving it *only* the spectral part left the red
  // channel almost flat with depth, which is why the slab read as one uniform
  // sheet of amber instead of thick-and-deep against thin-and-pale.
  vec3 sigmaD = vec3(0.30 * dot(sigma, vec3(0.3333))) + 0.16 * sigma;
  vec3 deep = uTint * vec3(0.94, 0.70, 0.33) * exp(-sigmaD * dist);

  vec3 col = uTint * 0.008;
  // Blend on the raw transmission, not on a scaled-and-clamped copy of it: the
  // clamp stops the hue walking at a fixed thickness and prints a hard contour
  // ring right through the middle of the slab.
  col += mix(deep, trans, trans.g) * (0.55 + 0.62 * back) * atten * 1.20;
  col += trans * fwd * atten * 0.42 * uScatter;

  // The ground edge glows hot and pale where almost no material is in the way.
  // Kept tight, so it reads as an edge rather than as a bloom.
  col += mix(uTint, vec3(1.0), 0.42) * exp(-dist * 8.0) * atten * 0.62;

  // Front side: only enough to say the surface is polished, not lit.
  vec3 Kf = normalize(vec3(-0.45, 0.60, 0.66));
  col += vec3(0.72, 0.74, 0.80) * pow(max(dot(reflect(-Kf, N), V), 0.0), 60.0) * 0.12;
  col += uTint * 0.025 * max(dot(N, Kf), 0.0);
  // Grain, and a darker line right at the silhouette so the slab has an outline.
  col *= 0.95 + 0.10 * fbm(sp * 5.0 + 12.0);
  col *= 0.78 + 0.22 * smoothstep(0.0, 0.028, k);

  col = 1.0 - exp(-col * 1.20);
  col *= 1.0 - 0.44 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.013;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
