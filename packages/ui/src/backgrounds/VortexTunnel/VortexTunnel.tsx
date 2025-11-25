'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { cn } from '../../utils/cn';

export interface VortexTunnelProps {
    color?: string;
    speed?: number;
    intensity?: number;
    className?: string;
    style?: React.CSSProperties;
}

const VortexShader = {
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
      float angle = atan(uv.y, uv.x);
      
      // Tunnel effect
      float tunnel = mod(1.0 / dist - uTime * 2.0, 1.0);
      tunnel = smoothstep(0.0, 0.1, tunnel) * smoothstep(1.0, 0.9, tunnel);
      
      // Spiral vortex
      float spiral = sin(angle * 8.0 + uTime * 3.0 - dist * 10.0);
      spiral = spiral * 0.5 + 0.5;
      
      // Rotation
      float rotation = sin(angle * 12.0 - uTime * 4.0) * 0.5 + 0.5;
      
      // Combine effects
      float brightness = (tunnel + spiral * 0.3 + rotation * 0.2) * uIntensity;
      brightness *= smoothstep(0.5, 0.0, dist);
      
      vec3 finalColor = uColor * brightness;
      
      gl_FragColor = vec4(finalColor, brightness);
    }
  `
};

function VortexMesh({ color, speed, intensity }: { color: string; speed: number; intensity: number }) {
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
        <mesh ref={meshRef} scale={[12, 12, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={VortexShader.vertexShader}
                fragmentShader={VortexShader.fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

export const VortexTunnel = memo(function VortexTunnel({
    color = '#ff00ff',
    speed = 1,
    intensity = 1,
    className,
    style,
}: VortexTunnelProps) {
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
                <VortexMesh color={color} speed={speed} intensity={intensity} />
            </Canvas>
        </div>
    );
});

export default VortexTunnel;
