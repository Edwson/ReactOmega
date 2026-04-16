'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { cn } from '../../utils/cn';

export interface QuantumFieldProps {
    /**
     * Primary color of the field
     * @default "#00d4ff"
     */
    color?: string;

    /**
     * Animation speed
     * @default 1
     */
    speed?: number;

    /**
     * Opacity of the field
     * @default 1
     */
    opacity?: number;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;
}

const QuantumShader = {
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      float t = uTime * 0.2;
      
      // Domain warping
      vec2 q = vec2(0.);
      q.x = snoise(uv + vec2(0.0, 0.0));
      q.y = snoise(uv + vec2(5.2, 1.3));

      vec2 r = vec2(0.);
      r.x = snoise(uv + 4.0 * q + vec2(t, 9.2));
      r.y = snoise(uv + 4.0 * q + vec2(8.3, t));

      float f = snoise(uv + 4.0 * r);
      
      // Color mixing
      vec3 color = mix(vec3(0.1, 0.0, 0.3), vec3(0.0, 0.0, 0.2), f);
      color = mix(color, uColor, length(q));
      color = mix(color, vec3(1.0), r.x);
      
      // Add quantum particles (sparkles)
      float sparkle = snoise(uv * 50.0 + t * 5.0);
      sparkle = step(0.98, sparkle);
      color += vec3(1.0) * sparkle * 0.5;
      
      // Vignette
      float vignette = 1.0 - length(uv - 0.5) * 1.5;
      vignette = smoothstep(0.0, 1.0, vignette);
      
      gl_FragColor = vec4(color, uOpacity * vignette);
    }
  `
};

function QuantumMesh({
    color,
    speed,
    opacity
}: {
    color: string;
    speed: number;
    opacity: number;
}) {
    const meshRef = useRef<any>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor: { value: new Color(color) },
            uOpacity: { value: opacity },
        }),
        [color, opacity]
    );

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime() * speed;
            meshRef.current.material.uniforms.uColor.value.set(color);
            meshRef.current.material.uniforms.uOpacity.value = opacity;
        }
    });

    return (
        <mesh ref={meshRef} scale={[2, 2, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={QuantumShader.vertexShader}
                fragmentShader={QuantumShader.fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

/**
 * QuantumField - A fluid quantum probability field
 */
export const QuantumField = memo(function QuantumField({
    color = '#00d4ff',
    speed = 1,
    opacity = 1,
    className,
    style,
}: QuantumFieldProps) {
<<<<<<< HEAD
=======
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return null;
    }

>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
    return (
        <div
            className={cn(
                'absolute inset-0 w-full h-full pointer-events-none z-0 bg-black',
                className
            )}
            style={style}
            aria-hidden="true"
        >
            <Canvas camera={{ position: [0, 0, 1] }}>
                <QuantumMesh
                    color={color}
                    speed={speed}
                    opacity={opacity}
                />
            </Canvas>
        </div>
    );
});

export default QuantumField;
