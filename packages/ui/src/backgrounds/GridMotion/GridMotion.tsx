'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { cn } from '../../utils/cn';

export interface GridMotionProps {
    /**
     * Grid color
     * @default "#00ffff"
     */
    color?: string;

    /**
     * Scroll speed
     * @default 1
     */
    speed?: number;

    /**
     * Grid size
     * @default 20
     */
    gridSize?: number;

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
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uGridSize;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // Perspective effect
      float perspective = mix(0.1, 1.0, uv.y);
      
      // Scrolling effect
      float scroll = uTime * 0.5;
      vec2 gridUV = vec2(uv.x / perspective, (uv.y + scroll) / perspective);
      
      // Grid lines
      vec2 grid = abs(fract(gridUV * uGridSize) - 0.5);
      float lineWidth = 0.02 / perspective;
      float gridPattern = min(
        smoothstep(lineWidth, 0.0, grid.x),
        smoothstep(lineWidth, 0.0, grid.y)
      );
      
      // Fade out at distance
      float fade = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
      
      // Horizon glow
      float horizon = smoothstep(0.5, 0.0, abs(uv.y - 1.0));
      horizon *= 2.0;
      
      vec3 finalColor = uColor * (gridPattern * fade + horizon * 0.5);
      float alpha = (gridPattern * fade + horizon * 0.3);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

function GridMesh({ color, speed, gridSize }: { color: string; speed: number; gridSize: number }) {
    const meshRef = useRef<any>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor: { value: new Color(color) },
            uGridSize: { value: gridSize },
        }),
        [color, gridSize]
    );

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime() * speed;
            meshRef.current.material.uniforms.uColor.value.set(color);
            meshRef.current.material.uniforms.uGridSize.value = gridSize;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[20, 20]} />
            <shaderMaterial
                vertexShader={GridShader.vertexShader}
                fragmentShader={GridShader.fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

/**
 * GridMotion - Retro-futuristic scrolling 3D grid
 */
export const GridMotion = memo(function GridMotion({
    color = '#00ffff',
    speed = 1,
    gridSize = 20,
    className,
    style,
}: GridMotionProps) {
    return (
        <div
            className={cn(
                'absolute inset-0 w-full h-full pointer-events-none z-0 bg-black',
                className
            )}
            style={style}
            aria-hidden="true"
        >
            <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
                <GridMesh color={color} speed={speed} gridSize={gridSize} />
            </Canvas>
        </div>
    );
});

export default GridMotion;
