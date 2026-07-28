"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useShader, hexToRgb } from "@/hooks/use-shader";

export interface CurlFlowProps {
  className?: string;
  /** Colour of the silk. @default "#9b8cff" */
  tint?: string;
  /** Colour in the folds. @default "#06060a" */
  background?: string;
  /** Zoom of the flow field — higher gives narrower bands. @default 2.2 */
  scale?: number;
  /** Advection steps, 1..8. More steps means longer, silkier streamlines. @default 5 */
  steps?: number;
  /** Flow speed multiplier. @default 1 */
  speed?: number;
  /** Band hardness — higher pinches the highlights. @default 1.15 */
  contrast?: number;
}

/**
 * CurlFlow — wide bands of silk folding through each other, driven by a real
 * curl-noise field.
 *
 * A three-octave FBM is treated as a scalar stream function ψ. The velocity is
 * the perpendicular of its gradient, (∂ψ/∂y, −∂ψ/∂x), which is divergence-free
 * by construction — that is the whole trick, and it is why the flow swirls and
 * shears without ever piling up into a source or draining into a sink the way
 * a raw noise-vector field does. Each pixel walks its coordinate a few steps
 * along that velocity, so it ends up sampling the value it had upstream; ψ read
 * at the advected position is therefore stretched along the streamlines, and a
 * sine of it becomes bands that follow the flow. The highlight is anisotropic:
 * brightness depends on the alignment of the local tangent with the light, the
 * way sheen on real silk depends on fibre direction rather than surface normal.
 * The pointer adds a genuine vortex — a tangential term about the cursor —
 * into the velocity before each step, so the fabric twists rather than dents.
 */
export function CurlFlow({
  className,
  tint = "#9b8cff",
  background = "#06060a",
  scale = 2.2,
  steps = 5,
  speed = 1,
  contrast = 1.15,
}: CurlFlowProps) {
  const uniforms = useMemo(
    () => ({
      uTint: hexToRgb(tint),
      uBg: hexToRgb(background),
      uScale: scale,
      uSteps: steps,
      uContrast: contrast,
    }),
    [tint, background, scale, steps, contrast],
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
          background: `linear-gradient(115deg, ${background} 0%, ${tint} 42%, ${background} 66%, ${tint} 88%, ${background} 100%)`,
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

float fbm3(vec2 p) {
  float a = 0.5;
  float v = 0.0;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    a *= 0.5;
  }
  return v;
}

// Scalar stream function.
float potential(vec2 p, float t) {
  return fbm3(p + vec2(t * 0.09, t * 0.16));
}

// Curl of that potential: perpendicular of the gradient, so divergence is zero
// and the field can only rotate and shear. Forward differences — three taps
// instead of the four a central difference would cost, and the bias is invisible.
vec2 curl(vec2 p, float t) {
  const float e = 0.045;
  float a = potential(p, t);
  float gx = (potential(p + vec2(e, 0.0), t) - a) / e;
  float gy = (potential(p + vec2(0.0, e), t) - a) / e;
  return vec2(gy, -gx);
}

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / m;
  vec2 pc = (uPointer.xy - 0.5 * uResolution) / m;
  float t = uTime * 0.3;

  vec2 q = uv * uScale;
  vec2 pcs = pc * uScale;
  float steps = clamp(uSteps, 1.0, 8.0);
  float h = 0.9 / steps;          // total advected distance stays constant
  vec2 vel = vec2(0.0);

  for (int i = 0; i < 8; i++) {
    if (float(i) >= steps) break;
    vel = curl(q, t);
    vec2 r = q - pcs;
    float w = uPointer.z * exp(-dot(r, r) * 1.7);
    vel += vec2(-r.y, r.x) * w * 3.4;   // vortex injected at the cursor
    q += vel * h * 0.60;
  }

  float s = potential(q, t);

  // Anisotropic sheen: silk is bright where the fibre tangent lines up with the
  // light, so the highlight rides the flow direction, not a surface normal.
  vec2 tangent = normalize(vel + vec2(1e-5, 1e-5));
  float aniso = pow(abs(dot(tangent, vec2(0.55, 0.84))), 3.5);

  float band = 0.5 + 0.5 * sin(s * 15.0 + t * 1.7);
  band = pow(band, max(uContrast, 0.05) * 3.0);

  float shade = clamp(band * (0.42 + 0.85 * aniso) + 0.05 * length(vel), 0.0, 1.0);

  vec3 hi = clamp(uTint * 1.45 + 0.16, 0.0, 1.0);
  vec3 col = mix(uBg, uTint, shade);
  col += hi * pow(shade, 4.5) * 0.55;

  col *= 1.0 - 0.38 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;

  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
