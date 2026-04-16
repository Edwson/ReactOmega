'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { cn } from '../../utils/cn';

export interface PulsarProps {
    color?: string;
    speed?: number;
    intensity?: number;
    className?: string;
    style?: React.CSSProperties;
}

const PulsarShader = {
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
    uniform float uIntensity;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv - 0.5;
      float dist = length(uv);
      
      // Pulsing core
      float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
      float core = 1.0 - smoothstep(0.0, 0.2 * pulse, dist);
      core = pow(core, 2.0);
      
      // Radiation beams
      float angle = atan(uv.y, uv.x);
      float beams = abs(sin(angle * 4.0 + uTime * 2.0));
      beams = pow(beams, 3.0);
      beams *= smoothstep(0.5, 0.1, dist);
      
      // Pulse rings
      float rings = sin(dist * 20.0 - uTime * 5.0) * 0.5 + 0.5;
      rings *= smoothstep(0.5, 0.0, dist);
      
      // Combine
      float brightness = (core * 2.0 + beams + rings * 0.5) * uIntensity;
      
      vec3 finalColor = uColor * brightness;
      
      gl_FragColor = vec4(finalColor, brightness);
    }
  `
};

function PulsarMesh({ color, speed, intensity }: { color: string; speed: number; intensity: number }) {
    const meshRef = useRef<any>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor: { value: new Color(color) },
            uIntensity: { value: intensity },
        }),
        [color, intensity]
    );

    useFrame((state) => {
        if (meshRef.current) {
            uniforms.uTime.value = state.clock.getElapsedTime() * speed;
        }
    });

    return (
        <mesh ref={meshRef} scale={[10, 10, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={PulsarShader.vertexShader}
                fragmentShader={PulsarShader.fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

export const Pulsar = memo(function Pulsar({
    color = '#00ff88',
    speed = 1,
    intensity = 1,
    className,
    style,
}: PulsarProps) {
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
                <PulsarMesh color={color} speed={speed} intensity={intensity} />
            </Canvas>
        </div>
    );
});

export default Pulsar;
