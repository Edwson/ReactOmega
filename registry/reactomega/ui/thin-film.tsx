"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface ThinFilmProps {
  className?: string;
  /** Mean film thickness in nanometres — picks which interference order you see. @default 380 */
  thickness?: number;
  /** Drift speed of the film. @default 1 */
  speed?: number;
  /** 0 collapses the fringes to grey, 1 is the raw interference colour. @default 0.68 */
  saturation?: number;
  /** Zoom of the thickness field — higher gives tighter fringes. @default 1.9 */
  scale?: number;
  /** Colour the whole film is biased toward. @default "#7b6cff" */
  tint?: string;
}

/**
 * ThinFilm — a soap-film / oil-slick sheen whose colour is computed from actual
 * thin-film interference rather than a rotated hue wheel.
 *
 * A warped FBM (crossed with two slow sine trains so the fringes stay crisp)
 * gives a thickness field in nanometres. The surface normal comes from finite
 * differences of that field, Snell's law bends the view ray to the internal
 * angle, and the reflected intensity at three representative wavelengths —
 * 610nm, 550nm, 465nm — is the two-beam result I(λ) = sin²(δ/2) with
 * δ = 4π·n·d·cosθ/λ + π, the π accounting for the hard-surface phase flip.
 * Because red, green and blue go in and out of phase at different rates, the
 * band order you get is the real one: magenta into gold into cyan, and the
 * colour genuinely shifts with viewing angle. The pointer squeezes the film
 * thinner, which walks every fringe under the cursor.
 */
export function ThinFilm({
  className,
  thickness = 380,
  speed = 1,
  saturation = 0.68,
  scale = 1.9,
  tint = "#7b6cff",
}: ThinFilmProps) {
  const uniforms = useMemo(
    () => ({
      uTint: hexToRgb(tint),
      uThickness: thickness,
      uSat: saturation,
      uScale: scale,
    }),
    [tint, thickness, saturation, scale],
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
          background: `radial-gradient(120% 90% at 30% 25%, ${tint} 0%, #1b1440 38%, #06060a 72%), linear-gradient(120deg, #06060a 0%, #2a1a4d 55%, #06060a 100%)`,
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
  float a = 0.5;
  float v = 0.0;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    a *= 0.5;
  }
  return v;
}

// Normalised film thickness, 0..1. Warped FBM gives the draining-soap blotches;
// the sine train reinstates the crisp fringe edges noise alone smears away.
float filmField(vec2 p, float t) {
  vec2 w = vec2(fbm(p + vec2(0.0, t * 0.11)), fbm(p * 1.13 + vec2(4.7, -t * 0.09)));
  float n = fbm(p + 2.3 * w);
  float ripple = 0.5 + 0.5 * sin(p.x * 2.7 + p.y * 1.9 + t * 0.8 + n * 5.0);
  return mix(n, ripple, 0.34);
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;

  float t = uTime * 0.5;
  vec2 p = uv * uScale;

  // The pointer presses the film thinner. Fringe order is a function of d, so
  // thinning here does not brighten the film — it walks the bands sideways.
  vec2 rel = uv - pc;
  float press = uPointer.z * exp(-dot(rel, rel) * 9.0);

  float e = 0.010;
  float h = filmField(p, t);
  vec3 n = normalize(vec3((h - filmField(p + vec2(e, 0.0), t)) * 2.2,
                          (h - filmField(p + vec2(0.0, e), t)) * 2.2, 0.22));

  // Snell: the optical path inside the film uses the refracted angle, not the
  // incident one, which is why the fringes crowd toward grazing incidence.
  float ior = 1.42;
  float cosI = clamp(n.z, 0.05, 1.0);
  float sinT = sqrt(max(0.0, 1.0 - cosI * cosI)) / ior;
  float cosT = sqrt(max(0.0, 1.0 - sinT * sinT));

  // A narrower thickness swing means fewer fringes across the frame, so the
  // bands stay broad and pastel instead of stacking into a rainbow moiré.
  float d = uThickness * (0.62 + 0.55 * h) * (1.0 - 0.45 * press);

  // Two-beam interference at three representative wavelengths.
  const vec3 LAMBDA = vec3(610.0, 550.0, 465.0);
  vec3 delta = (12.566370614 * ior * d * cosT) / LAMBDA + 3.14159265;
  vec3 film = 0.5 - 0.5 * cos(delta);

  // Knock the green channel back: unweighted, the middle wavelength peaks alone
  // and the frame reads as a heat map rather than an oil slick.
  film = pow(film, vec3(0.94, 1.18, 1.0));
  float lum = dot(film, vec3(0.2126, 0.7152, 0.0722));
  film = clamp(mix(vec3(lum), film, uSat), 0.0, 1.0);
  film *= mix(vec3(1.0), uTint * 1.9 + 0.12, 0.60);

  // Where the film runs thin it reflects almost nothing. That black is what
  // stops the whole frame reading as one flat rainbow smear.
  float density = smoothstep(0.15, 0.72, h) * (0.58 + 0.42 * pow(1.0 - cosI, 2.0));
  vec3 col = uTint * 0.026 + film * density * 0.88;

  vec3 L = normalize(vec3(0.35, 0.68, 0.64));
  col += pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 48.0) * 0.50;
  col += uTint * 0.14 * press;

  col *= 1.0 - 0.42 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
