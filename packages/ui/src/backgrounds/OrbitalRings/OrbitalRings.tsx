'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color, TorusGeometry, MeshBasicMaterial } from 'three';
import { cn } from '../../utils/cn';

export interface OrbitalRingsProps {
    /**
     * Color of the rings
     * @default "#8b5cf6"
     */
    color?: string;

    /**
     * Speed of rotation
     * @default 1
     */
    speed?: number;

    /**
     * Radius of the rings
     * @default 1
     */
    radius?: number;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;
}

function Rings({
    color,
    speed,
    radius
}: {
    color: string;
    speed: number;
    radius: number;
}) {
    const groupRef = useRef<any>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.x = state.clock.getElapsedTime() * speed * 0.2;
            groupRef.current.rotation.y = state.clock.getElapsedTime() * speed * 0.3;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Outer Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius * 3, 0.02, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} />
            </mesh>

            {/* Middle Ring */}
            <mesh rotation={[0, Math.PI / 4, 0]}>
                <torusGeometry args={[radius * 2, 0.02, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.7} />
            </mesh>

            {/* Inner Ring */}
            <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
                <torusGeometry args={[radius, 0.02, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.9} />
            </mesh>

            {/* Core */}
            <mesh>
                <sphereGeometry args={[radius * 0.2, 32, 32]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </group>
    );
}

/**
 * OrbitalRings - Rotating 3D rings/gyroscopes
 */
export const OrbitalRings = memo(function OrbitalRings({
    color = '#8b5cf6',
    speed = 1,
    radius = 1,
    className,
    style,
}: OrbitalRingsProps) {
    return (
        <div
            className={cn(
                'absolute inset-0 w-full h-full pointer-events-none z-0 bg-black',
                className
            )}
            style={style}
            aria-hidden="true"
        >
            <Canvas camera={{ position: [0, 0, 10] }}>
                <Rings color={color} speed={speed} radius={radius} />
            </Canvas>
        </div>
    );
});

export default OrbitalRings;
