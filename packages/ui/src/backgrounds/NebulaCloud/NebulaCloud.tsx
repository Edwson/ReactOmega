'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { cn } from '../../utils/cn';

export interface NebulaCloudProps {
    /**
     * Primary color of the nebula
     * @default "#8b5cf6"
     */
    color?: string;

    /**
     * Speed of the cloud movement
     * @default 1
     */
    speed?: number;

    /**
     * Opacity of the clouds
     * @default 0.5
     */
    opacity?: number;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;
}

const NebulaShader = {
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
    uniform float uOpacity;
    varying vec2 vUv;

    // Simplex noise function
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
      
      // Create multiple layers of noise for volumetric feel
      float n1 = snoise(uv * 3.0 + uTime * 0.1);
      float n2 = snoise(uv * 6.0 - uTime * 0.15);
      float n3 = snoise(uv * 12.0 + uTime * 0.2);
      
      float noise = n1 * 0.5 + n2 * 0.25 + n3 * 0.125;
      
      // Soften the noise
      noise = smoothstep(-0.2, 0.8, noise);
      
      vec3 color = uColor * noise;
      
      // Add some variation
      color += vec3(0.1, 0.1, 0.2) * (1.0 - noise) * 0.2;

      gl_FragColor = vec4(color, noise * uOpacity);
    }
  `
};

function NebulaMesh({
    color,
    speed,
    opacity
}: {
    color: string;
    speed: number;
    opacity: number;
}) {
    const meshRef = useRef<any>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor: { value: new Color(color) },
            uOpacity: { value: opacity },
        }),
        [color, opacity]
    );

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime() * speed;
            meshRef.current.material.uniforms.uColor.value.set(color);
            meshRef.current.material.uniforms.uOpacity.value = opacity;
        }
    });

    return (
        <mesh ref={meshRef} scale={[10, 10, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={NebulaShader.vertexShader}
                fragmentShader={NebulaShader.fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

/**
 * NebulaCloud - A volumetric gas cloud background
 */
export const NebulaCloud = memo(function NebulaCloud({
    color = '#8b5cf6',
    speed = 1,
    opacity = 0.5,
    className,
    style,
}: NebulaCloudProps) {
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
                <NebulaMesh color={color} speed={speed} opacity={opacity} />
            </Canvas>
        </div>
    );
});

export default NebulaCloud;
