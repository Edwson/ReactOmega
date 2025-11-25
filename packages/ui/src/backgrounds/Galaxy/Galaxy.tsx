'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cn } from '../../utils/cn';

export interface GalaxyProps {
    count?: number;
    color?: string;
    radius?: number;
    arms?: number;
    spin?: number;
    className?: string;
    style?: React.CSSProperties;
}

const vertexShader = `
  attribute float aScale;
  attribute vec3 aRandomness;
  
  uniform float uTime;
  uniform float uSize;
  
  varying vec3 vColor;
  
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Rotation animation
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleOffset;
    
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;
    
    // Add randomness
    modelPosition.xyz += aRandomness;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    
    // Size attenuation
    gl_PointSize = uSize * aScale * (1.0 / -viewPosition.z);
    
    // Color variation based on distance
    vColor = color;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circular point
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 3.0);
    
    // Add glow
    vec3 glowColor = vColor * 2.0;
    vec3 finalColor = mix(vColor, glowColor, strength * 0.5);
    
    gl_FragColor = vec4(finalColor, strength);
  }
`;

function GalaxyPoints({ count, color, radius, arms, spin }: Required<Omit<GalaxyProps, 'className' | 'style'>>) {
    const points = useRef<THREE.Points>(null!);

    const { positions, colors, scales, randomness } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const randomness = new Float32Array(count * 3);

        const insideColor = new THREE.Color(color);
        const outsideColor = new THREE.Color('#1b3984');
        const mixedColor = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Position
            const r = Math.random() * radius;
            const spinAngle = r * spin;
            const branchAngle = ((i % arms) / arms) * Math.PI * 2;

            // Improved randomness with power distribution
            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r;
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r;
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r;

            positions[i3] = Math.cos(branchAngle + spinAngle) * r;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r;

            randomness[i3] = randomX;
            randomness[i3 + 1] = randomY;
            randomness[i3 + 2] = randomZ;

            // Color with better gradient
            mixedColor.lerpColors(insideColor, outsideColor, r / radius);

            // Add brightness variation
            const brightness = 0.5 + Math.random() * 0.5;
            colors[i3] = mixedColor.r * brightness;
            colors[i3 + 1] = mixedColor.g * brightness;
            colors[i3 + 2] = mixedColor.b * brightness;

            // Scale variation for depth
            scales[i] = Math.random() * 0.5 + 0.5;
        }

        return { positions, colors, scales, randomness };
    }, [count, color, radius, arms, spin]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uSize: { value: 30.0 },
        }),
        []
    );

    useFrame((state) => {
        if (points.current) {
            uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                    args={[colors, 3]}
                />
                <bufferAttribute
                    attach="attributes-aScale"
                    count={scales.length}
                    array={scales}
                    itemSize={1}
                    args={[scales, 1]}
                />
                <bufferAttribute
                    attach="attributes-aRandomness"
                    count={randomness.length / 3}
                    array={randomness}
                    itemSize={3}
                    args={[randomness, 3]}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexColors
            />
        </points>
    );
}

/**
 * Galaxy - Premium 3D spiral galaxy with advanced shaders
 */
export const Galaxy = memo(function Galaxy({
    count = 10000,
    color = '#2e9aff',
    radius = 5,
    arms = 3,
    spin = 1,
    className,
    style,
}: GalaxyProps) {
    return (
        <div
            className={cn(
                'absolute inset-0 w-full h-full pointer-events-none z-0 bg-black',
                className
            )}
            style={style}
            aria-hidden="true"
        >
            <Canvas camera={{ position: [0, 3, 5], fov: 75 }}>
                <GalaxyPoints
                    count={count}
                    color={color}
                    radius={radius}
                    arms={arms}
                    spin={spin}
                />
            </Canvas>
        </div>
    );
});

export default Galaxy;
