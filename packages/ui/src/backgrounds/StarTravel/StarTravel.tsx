'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color, Vector3 } from 'three';
import { cn } from '../../utils/cn';

export interface StarTravelProps {
    /**
     * Color of the stars
     * @default "#ffffff"
     */
    color?: string;

    /**
     * Speed of travel
     * @default 1
     */
    speed?: number;

    /**
     * Number of stars
     * @default 1000
     */
    starCount?: number;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;
}

function StarField({
    color,
    speed,
    starCount
}: {
    color: string;
    speed: number;
    starCount: number;
}) {
    const meshRef = useRef<any>(null);

    const [positions, colors] = useMemo(() => {
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const baseColor = new Color(color);

        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            colors[i * 3] = baseColor.r;
            colors[i * 3 + 1] = baseColor.g;
            colors[i * 3 + 2] = baseColor.b;
        }

        return [positions, colors];
    }, [starCount, color]);

    useFrame((state) => {
        if (meshRef.current) {
            const positions = meshRef.current.geometry.attributes.position.array;

            for (let i = 0; i < starCount; i++) {
                let z = positions[i * 3 + 2];
                z += speed * 10;

                if (z > 1000) {
                    z -= 2000;
                    positions[i * 3] = (Math.random() - 0.5) * 2000;
                    positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
                }

                positions[i * 3 + 2] = z;
            }

            meshRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={starCount}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={starCount}
                    array={colors}
                    itemSize={3}
                    args={[colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={2}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
}

/**
 * StarTravel - Warp speed star travel effect
 */
export const StarTravel = memo(function StarTravel({
    color = '#ffffff',
    speed = 1,
    starCount = 1000,
    className,
    style,
}: StarTravelProps) {
    return (
        <div
            className={cn(
                'absolute inset-0 w-full h-full pointer-events-none z-0 bg-black',
                className
            )}
            style={style}
            aria-hidden="true"
        >
            <Canvas camera={{ position: [0, 0, 1000], fov: 75 }}>
                <StarField color={color} speed={speed} starCount={starCount} />
            </Canvas>
        </div>
    );
});

export default StarTravel;
