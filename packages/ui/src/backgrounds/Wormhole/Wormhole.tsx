'use client';

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color, Vector2 } from 'three';
import { cn } from '../../utils/cn';

export interface WormholeProps {
    /**
     * Primary color of the wormhole (center/light)
     * @default "#ff0080"
     */
    color?: string;

    /**
     * Secondary color of the wormhole (edges/dark)
     * @default "#4c00ff"
     */
    secondaryColor?: string;

    /**
     * Speed of the travel animation
     * @default 1
     */
    speed?: number;

    /**
     * Size/Scale of the tunnel effect
     * @default 1
     */
    size?: number;

    /**
     * Intensity of the glow/brightness
     * @default 1
     */
    intensity?: number;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;
}

const WormholeShader = {
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
    uniform vec3 uSecondaryColor;
    uniform float uSize;
    uniform float uIntensity;
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
      vec2 uv = vUv - 0.5;
      float r = length(uv) * uSize;
      float a = atan(uv.y, uv.x);
      
      // Create tunnel coordinates
      vec2 tunnelUv = vec2(1.0 / r + uTime, a / 3.14159);
      
      // Generate noise pattern
      float n = snoise(tunnelUv * vec2(2.0, 8.0));
      float n2 = snoise(tunnelUv * vec2(4.0, 16.0) + vec2(uTime * 0.5, 0.0));
      
      // Combine noise for texture
      float texture = n * 0.5 + n2 * 0.25 + 0.5;
      
      // Create core glow
      float core = 1.0 / (r * 2.0 + 0.1);
      core = pow(core, 1.5);
      
      // Mix colors
      vec3 color = mix(uSecondaryColor, uColor, texture * core);
      
      // Add depth fading
      float depth = smoothstep(0.0, 0.5, r);
      color *= depth;
      
      // Intensity boost
      color *= uIntensity * (1.0 + core);

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

function WormholeMesh({
    color,
    secondaryColor,
    speed,
    size,
    intensity
}: {
    color: string;
    secondaryColor: string;
    speed: number;
    size: number;
    intensity: number;
}) {
    const meshRef = useRef<any>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor: { value: new Color(color) },
            uSecondaryColor: { value: new Color(secondaryColor) },
            uSize: { value: size },
            uIntensity: { value: intensity },
        }),
        [color, secondaryColor, size, intensity]
    );

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime() * speed * 0.5;
            meshRef.current.material.uniforms.uColor.value.set(color);
            meshRef.current.material.uniforms.uSecondaryColor.value.set(secondaryColor);
            meshRef.current.material.uniforms.uSize.value = size;
            meshRef.current.material.uniforms.uIntensity.value = intensity;
        }
    });

    return (
        <mesh ref={meshRef} scale={[10, 10, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={WormholeShader.vertexShader}
                fragmentShader={WormholeShader.fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

/**
 * Wormhole - A 3D cosmic tunnel effect
 */
export const Wormhole = memo(function Wormhole({
    color = '#ff0080',
    secondaryColor = '#4c00ff',
    speed = 1,
    size = 1,
    intensity = 1,
    className,
    style,
}: WormholeProps) {
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
                <WormholeMesh
                    color={color}
                    secondaryColor={secondaryColor}
                    speed={speed}
                    size={size}
                    intensity={intensity}
                />
            </Canvas>
        </div>
    );
});

export default Wormhole;
