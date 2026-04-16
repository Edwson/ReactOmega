'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface BlackHoleProps {
    /**
     * Primary color of the accretion disk
     * @default "#ff6600"
     */
    color?: string;

    /**
     * Animation speed multiplier
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
 * BlackHole - Canvas-based black hole with accretion disk, orbital particles, and gravitational lensing halo
 */
export const BlackHole = memo(function BlackHole({
    color = '#ff6600',
    speed = 1,
    className,
    style,
}: BlackHoleProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        // Parse color to RGB
        const parseColor = (hex: string): [number, number, number] => {
            const clean = hex.replace('#', '');
            if (clean.length === 6) {
                return [
                    parseInt(clean.slice(0, 2), 16),
                    parseInt(clean.slice(2, 4), 16),
                    parseInt(clean.slice(4, 6), 16),
                ];
            }
            return [255, 102, 0];
        };
        const [r, g, b] = parseColor(color);

        // Accretion disk particles
        const particleCount = 320;
        interface Particle {
            angle: number;
            radius: number;
            baseRadius: number;
            angularSpeed: number;
            size: number;
            opacity: number;
            layer: number;
        }

        const particles: Particle[] = Array.from({ length: particleCount }, () => {
            const layer = Math.random();
            const baseRadius = 0.18 + layer * 0.28; // fraction of min dimension
            return {
                angle: Math.random() * Math.PI * 2,
                radius: baseRadius,
                baseRadius,
                angularSpeed: (0.004 + Math.random() * 0.006) * (Math.random() > 0.5 ? 1 : -1),
                size: 0.5 + Math.random() * 2.5,
                opacity: 0.3 + Math.random() * 0.7,
                layer,
            };
        });

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            const { width, height } = canvas;
            const cx = width / 2;
            const cy = height / 2;
            const minDim = Math.min(width, height);
            const holeRadius = minDim * 0.1;

            // Dark background fade
            ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
            ctx.fillRect(0, 0, width, height);

            // Gravitational lensing halo — outer glow rings
            for (let i = 3; i >= 1; i--) {
                const haloRadius = holeRadius * (2.8 + i * 0.8);
                const gradient = ctx.createRadialGradient(cx, cy, holeRadius * 1.2, cx, cy, haloRadius);
                gradient.addColorStop(0, `rgba(${r},${g},${b},${0.04 * i})`);
                gradient.addColorStop(0.5, `rgba(${r},${g},${b},${0.02 * i})`);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.beginPath();
                ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Accretion disk glow band
            const diskGrad = ctx.createRadialGradient(cx, cy, holeRadius * 1.05, cx, cy, holeRadius * 2.6);
            diskGrad.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
            diskGrad.addColorStop(0.35, `rgba(${Math.min(r + 80, 255)},${Math.min(g + 60, 255)},20,0.25)`);
            diskGrad.addColorStop(0.7, `rgba(${r},${Math.floor(g * 0.4)},0,0.1)`);
            diskGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(cx, cy, holeRadius * 2.6, 0, Math.PI * 2);
            ctx.fillStyle = diskGrad;
            ctx.fill();

            // Orbital particles
            for (const p of particles) {
                p.angle += p.angularSpeed * speed;
                // Slight radial oscillation
                const radiusNow = p.baseRadius + Math.sin(p.angle * 3 + time * 0.5) * 0.012;
                const px = cx + Math.cos(p.angle) * radiusNow * minDim;
                const py = cy + Math.sin(p.angle) * radiusNow * minDim * 0.32; // flatten for disk perspective

                // Depth cue: particles behind center are dimmer
                const behindFactor = Math.sin(p.angle) > 0 ? 0.45 : 1;
                const alpha = p.opacity * behindFactor;

                // Hot inner / cool outer color shift
                const heat = 1 - p.layer;
                const pr = Math.min(255, Math.floor(r + heat * (255 - r)));
                const pg = Math.min(255, Math.floor(g + heat * 120));
                const pb = Math.min(255, Math.floor(b * (1 - heat)));

                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${pr},${pg},${pb},${alpha})`;
                ctx.fill();
            }

            // Black hole core
            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, holeRadius);
            coreGrad.addColorStop(0, 'rgba(0,0,0,1)');
            coreGrad.addColorStop(0.75, 'rgba(0,0,0,1)');
            coreGrad.addColorStop(1, `rgba(${r},${g},${b},0.6)`);
            ctx.beginPath();
            ctx.arc(cx, cy, holeRadius, 0, Math.PI * 2);
            ctx.fillStyle = coreGrad;
            ctx.fill();

            // Bright photon ring
            ctx.beginPath();
            ctx.arc(cx, cy, holeRadius * 1.08, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${Math.min(r + 120, 255)},${Math.min(g + 100, 255)},200,0.9)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            time += 0.016 * speed;
            animationFrameId = requestAnimationFrame(draw);
        };

        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, speed]);

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

export default BlackHole;
