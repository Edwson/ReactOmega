'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color, Vector2 } from 'three';
import { cn } from '../../utils/cn';

export interface AuroraProps {
    /**
     * Primary color of the aurora
     * @default "#00ff88"
     */
    color?: string;

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

const AuroraShader = {
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
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
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
      
      // Create waving effect
      float n1 = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uv.y * 2.0 - uTime * 0.2));
      float n2 = snoise(vec2(uv.x * 4.0 - uTime * 0.2, uv.y * 4.0 + uTime * 0.1));
      
      float wave = n1 * 0.5 + n2 * 0.25;
      
      // Vertical gradient for aurora shape
      float aurora = smoothstep(0.0, 0.8, wave + uv.y * 0.5);
      aurora *= smoothstep(1.0, 0.5, uv.y); // Fade out at top
      
      // Color mixing
      vec3 finalColor = mix(vec3(0.0), uColor, aurora);
      
      // Add some vertical streaks
      float streaks = snoise(vec2(uv.x * 10.0, uTime * 0.5));
      finalColor += uColor * streaks * 0.2 * aurora;

      gl_FragColor = vec4(finalColor, aurora * 0.8);
    }
  `
};

function AuroraMesh({ color, speed }: { color: string; speed: number }) {
    const meshRef = useRef<any>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor: { value: new Color(color) },
        }),
        [color]
    );

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime() * speed;
            meshRef.current.material.uniforms.uColor.value.set(color);
        }
    });

    return (
        <mesh ref={meshRef} scale={[10, 10, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={AuroraShader.vertexShader}
                fragmentShader={AuroraShader.fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

/**
 * Aurora - Northern lights effect
 */
export const Aurora = memo(function Aurora({
    color = '#00ff88',
    speed = 1,
    className,
    style,
}: AuroraProps) {
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
                <AuroraMesh color={color} speed={speed} />
            </Canvas>
        </div>
    );
});

export default Aurora;
