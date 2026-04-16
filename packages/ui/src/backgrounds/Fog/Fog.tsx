'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface FogProps {
    /**
     * Base color of the fog
     * @default "#8888ff"
     */
    color?: string;

    /**
     * Density of the fog layers (0.1–3)
     * @default 1
     */
    density?: number;

    /**
     * Speed of the fog movement
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

/**
 * Fog - Multi-layer flowing fog effect using layered sine-wave noise on canvas
 */
export const Fog = memo(function Fog({
    color = '#8888ff',
    density = 1,
    speed = 1,
    className,
    style,
}: FogProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        // Parse hex color to RGB
        const parseColor = (hex: string): [number, number, number] => {
            const clean = hex.replace('#', '');
            if (clean.length === 6) {
                return [
                    parseInt(clean.slice(0, 2), 16),
                    parseInt(clean.slice(2, 4), 16),
                    parseInt(clean.slice(4, 6), 16),
                ];
            }
            return [136, 136, 255];
        };
        const [r, g, b] = parseColor(color);

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Fog layer configuration
        interface FogLayer {
            yBase: number;     // base y as fraction of height
            amplitude: number; // wave amplitude fraction
            freq: number;      // horizontal frequency
            phaseOffset: number;
            driftX: number;    // horizontal drift per second
            driftY: number;    // vertical drift
            alpha: number;     // max opacity
            thickness: number; // gradient spread fraction
        }

        const layerCount = Math.round(4 + density * 3);
        const layers: FogLayer[] = Array.from({ length: layerCount }, (_, i) => ({
            yBase: 0.15 + (i / layerCount) * 0.75,
            amplitude: 0.04 + Math.random() * 0.08,
            freq: 0.003 + Math.random() * 0.006,
            phaseOffset: Math.random() * Math.PI * 2,
            driftX: (0.02 + Math.random() * 0.04) * (Math.random() > 0.5 ? 1 : -1),
            driftY: (0.005 + Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1),
            alpha: (0.05 + Math.random() * 0.12) * Math.min(density, 2),
            thickness: 0.12 + Math.random() * 0.18,
        }));

        // Pseudo-noise using multiple sine harmonics
        const noise = (x: number, t: number, freq: number, phase: number): number => {
            return (
                Math.sin(x * freq + t * 0.7 + phase) * 0.5 +
                Math.sin(x * freq * 2.1 + t * 0.4 + phase * 1.3) * 0.25 +
                Math.sin(x * freq * 3.7 + t * 1.1 + phase * 0.8) * 0.125 +
                Math.sin(x * freq * 0.5 + t * 0.2 + phase * 2.1) * 0.125
            );
        };

        const draw = () => {
            const { width, height } = canvas;

            // Clear with a dark, semi-transparent overlay for trailing effect
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(0,0,0,0.92)';
            ctx.fillRect(0, 0, width, height);

            for (const layer of layers) {
                const t = time * speed;
                const yCenter = (layer.yBase + Math.sin(t * layer.driftY + layer.phaseOffset) * 0.06) * height;
                const spread = layer.thickness * height;

                // Draw fog as a blurred horizontal band with per-column y-offset
                // Build the fog using a horizontal gradient band, warped per column
                const imageData = ctx.getImageData(0, Math.max(0, yCenter - spread * 1.5), width, Math.min(height, spread * 3));

                // Use a simpler approach: draw vertical gradient strips per sample point
                const sampleStep = 4; // pixels per sample — balance quality vs perf
                for (let x = 0; x < width; x += sampleStep) {
                    const warp = noise(x, t, layer.freq, layer.phaseOffset) * layer.amplitude * height;
                    const yMid = yCenter + warp;

                    const grad = ctx.createLinearGradient(0, yMid - spread, 0, yMid + spread);
                    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
                    grad.addColorStop(0.35, `rgba(${r},${g},${b},${layer.alpha})`);
                    grad.addColorStop(0.5, `rgba(${r},${g},${b},${layer.alpha * 1.4})`);
                    grad.addColorStop(0.65, `rgba(${r},${g},${b},${layer.alpha})`);
                    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

                    ctx.fillStyle = grad;
                    ctx.fillRect(x + layer.driftX * t * 20 % sampleStep, yMid - spread, sampleStep, spread * 2);
                }

                void imageData; // suppress unused warning
            }

            time += 0.016;
            animationFrameId = requestAnimationFrame(draw);
        };

        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, density, speed]);

    return (
        <canvas
            ref={canvasRef}
            className={cn(
                'absolute inset-0 w-full h-full pointer-events-none z-0 bg-black',
                className
            )}
            style={style}
            aria-hidden="true"
        />
    );
});

export default Fog;
