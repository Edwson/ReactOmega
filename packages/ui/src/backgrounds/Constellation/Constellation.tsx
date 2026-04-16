'use client';

import { useRef, useMemo, useState, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Vector3, Color } from 'three';
import { cn } from '../../utils/cn';

export interface ConstellationProps {
    /**
     * Number of stars
     * @default 150
     */
    starCount?: number;

    /**
     * Color of the stars
     * @default "#ffffff"
     */
    color?: string;

    /**
     * Color of the connection lines
     * @default "#ffffff"
     */
    lineColor?: string;

    /**
     * Maximum distance for connections
     * @default 2.5
     */
    connectionDistance?: number;

    /**
     * Animation speed
     * @default 1
     */
    speed?: number;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;
}

function ConstellationMesh({
    starCount,
    color,
    lineColor,
    connectionDistance,
    speed,
}: Required<Omit<ConstellationProps, 'className' | 'style'>>) {
    const pointsRef = useRef<any>(null);
    const linesRef = useRef<any>(null);

    // Initialize particles
    const [particles] = useState(() => {
        const temp = [];
        for (let i = 0; i < starCount; i++) {
            temp.push({
                position: new Vector3(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 10
                ),
                velocity: new Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    0
                )
            });
        }
        return temp;
    });

    // Create geometry buffers
    const positions = useMemo(() => new Float32Array(starCount * 3), [starCount]);
    const linePositions = useMemo(() => new Float32Array(starCount * starCount * 3), [starCount]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        let lineIndex = 0;

        // Update particles
        particles.forEach((particle, i) => {
            // Move particle
            particle.position.x += particle.velocity.x * speed;
            particle.position.y += particle.velocity.y * speed;

            // Bounce off edges (soft limits)
            if (Math.abs(particle.position.x) > 10) particle.velocity.x *= -1;
            if (Math.abs(particle.position.y) > 10) particle.velocity.y *= -1;

            // Mouse interaction
            const mouse = new Vector3(
                (state.mouse.x * 10),
                (state.mouse.y * 10),
                0
            );
            const distToMouse = particle.position.distanceTo(mouse);
            if (distToMouse < 3) {
                const repulsion = particle.position.clone().sub(mouse).normalize().multiplyScalar(0.05);
                particle.position.add(repulsion);
            }

            // Update position buffer
            positions[i * 3] = particle.position.x;
            positions[i * 3 + 1] = particle.position.y;
            positions[i * 3 + 2] = particle.position.z;

            // Check connections
            for (let j = i + 1; j < starCount; j++) {
                const other = particles[j];
                const dist = particle.position.distanceTo(other.position);

                if (dist < connectionDistance) {
                    linePositions[lineIndex * 3] = particle.position.x;
                    linePositions[lineIndex * 3 + 1] = particle.position.y;
                    linePositions[lineIndex * 3 + 2] = particle.position.z;

                    linePositions[lineIndex * 3 + 3] = other.position.x;
                    linePositions[lineIndex * 3 + 4] = other.position.y;
                    linePositions[lineIndex * 3 + 5] = other.position.z;

                    lineIndex += 2;
                }
            }
        });

        // Update geometries
        if (pointsRef.current) {
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
        if (linesRef.current) {
            linesRef.current.geometry.setDrawRange(0, lineIndex);
            linesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={starCount}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    color={color}
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                />
            </points>
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={starCount * starCount} // Max possible lines
                        array={linePositions}
                        itemSize={3}
                        args={[linePositions, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color={lineColor}
                    transparent
                    opacity={0.2}
                    linewidth={1}
                />
            </lineSegments>
        </>
    );
}

/**
 * Constellation - Interactive particle network
 */
export const Constellation = memo(function Constellation({
    starCount = 150,
    color = '#ffffff',
    lineColor = '#ffffff',
    connectionDistance = 2.5,
    speed = 1,
    className,
    style,
}: ConstellationProps) {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return null;
    }

    return (
        <div
            className={cn(
                'absolute inset-0 w-full h-full pointer-events-none z-0 bg-black',
                className
            )}
            style={style}
            aria-hidden="true"
        >
            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
                <ConstellationMesh
                    starCount={starCount}
                    color={color}
                    lineColor={lineColor}
                    connectionDistance={connectionDistance}
                    speed={speed}
                />
            </Canvas>
        </div>
    );
});

export default Constellation;
