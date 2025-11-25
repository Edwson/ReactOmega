'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { cn } from '../../utils/cn';

export interface SupernovaProps {
    color?: string;
    intensity?: number;
    speed?: number;
    className?: string;
    style?: React.CSSProperties;
}

const SupernovaShader = {
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

    // Noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv - 0.5;
      float dist = length(uv);
      
      // Core explosion
      float core = 1.0 - smoothstep(0.0, 0.3, dist);
      core = pow(core, 3.0);
      
      // Shockwave rings
      float wave1 = abs(sin((dist - uTime * 0.5) * 20.0));
      wave1 = smoothstep(0.8, 1.0, wave1);
      wave1 *= smoothstep(0.8, 0.0, dist);
      
      float wave2 = abs(sin((dist - uTime * 0.3) * 15.0));
      wave2 = smoothstep(0.7, 1.0, wave2);
      wave2 *= smoothstep(0.9, 0.0, dist);
      
      // Energy rays
      float angle = atan(uv.y, uv.x);
      float rays = abs(sin(angle * 8.0 + uTime * 2.0));
      rays = pow(rays, 5.0);
      rays *= smoothstep(0.8, 0.0, dist);
      
      // Particle field
      vec2 particleUV = uv * 10.0 + uTime * 0.5;
      float particles = random(floor(particleUV));
      particles *= smoothstep(0.5, 0.0, fract(particleUV.x));
      particles *= smoothstep(0.5, 0.0, fract(particleUV.y));
      particles *= smoothstep(0.7, 0.0, dist);
      
      // Combine effects
      float brightness = core * 2.0 + wave1 + wave2 + rays * 0.5 + particles * 2.0;
      brightness *= uIntensity;
      
      // Color with temperature gradient
      vec3 hotColor = uColor * 2.0;
      vec3 coolColor = uColor * 0.5;
      vec3 finalColor = mix(coolColor, hotColor, core);
      finalColor += vec3(1.0, 0.8, 0.6) * wave1;
      finalColor += vec3(1.0, 0.5, 0.2) * wave2;
      
      gl_FragColor = vec4(finalColor * brightness, brightness);
    }
  `
};

function SupernovaMesh({ color, intensity, speed }: { color: string; intensity: number; speed: number }) {
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
            uniforms.uColor.value.set(color);
            uniforms.uIntensity.value = intensity;
        }
    });

    return (
        <mesh ref={meshRef} scale={[15, 15, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={SupernovaShader.vertexShader}
                fragmentShader={SupernovaShader.fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

export const Supernova = memo(function Supernova({
    color = '#ff6600',
    intensity = 1,
    speed = 1,
    className,
    style,
}: SupernovaProps) {
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
                <SupernovaMesh color={color} intensity={intensity} speed={speed} />
            </Canvas>
        </div>
    );
});

export default Supernova;
