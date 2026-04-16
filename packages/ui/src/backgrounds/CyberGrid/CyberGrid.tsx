'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { cn } from '../../utils/cn';

export interface CyberGridProps {
    /**
     * Color of the grid lines
     * @default "#00ff88"
     */
    color?: string;

    /**
     * Speed of the grid movement
     * @default 1
     */
    speed?: number;

    /**
     * Height/Intensity of the terrain distortion
     * @default 1
     */
    height?: number;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;
}

const GridShader = {
    vertexShader: `
    uniform float uTime;
    uniform float uHeight;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      
      vec3 pos = position;
      
      // Create moving terrain effect
      float elevation = sin(pos.x * 2.0 + uTime) * sin(pos.y * 2.0 + uTime) * uHeight;
      pos.z += elevation;
      
      vElevation = elevation;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 uColor;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      // Create grid lines
      float gridX = step(0.98, fract(vUv.x * 20.0));
      float gridY = step(0.98, fract(vUv.y * 20.0));
      
      float grid = max(gridX, gridY);
      
      // Fade out in distance
      float alpha = grid * (1.0 - vUv.y);
      
      // Add glow based on elevation
      vec3 color = uColor + vec3(vElevation * 0.5);
      
      gl_FragColor = vec4(color, alpha);
    }
  `
};

function GridMesh({
    color,
    speed,
    height
}: {
    color: string;
    speed: number;
    height: number;
}) {
    const meshRef = useRef<any>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor: { value: new Color(color) },
            uHeight: { value: height },
        }),
        [color, height]
    );

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime() * speed;
            meshRef.current.material.uniforms.uColor.value.set(color);
            meshRef.current.material.uniforms.uHeight.value = height;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[20, 20, 40, 40]} />
            <shaderMaterial
                vertexShader={GridShader.vertexShader}
                fragmentShader={GridShader.fragmentShader}
                uniforms={uniforms}
                transparent
                wireframe={false}
            />
        </mesh>
    );
}

/**
 * CyberGrid - A retro-futuristic 3D grid terrain
 */
export const CyberGrid = memo(function CyberGrid({
    color = '#00ff88',
    speed = 1,
    height = 1,
    className,
    style,
}: CyberGridProps) {
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
            <Canvas camera={{ position: [0, 1, 2] }}>
                <GridMesh color={color} speed={speed} height={height} />
            </Canvas>
        </div>
    );
});

export default CyberGrid;
