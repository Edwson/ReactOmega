'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface AsteroidFieldProps {
    /**
     * Number of asteroids
     * @default 80
     */
    count?: number;

    /**
     * Speed multiplier for asteroid movement
     * @default 1
     */
    speed?: number;

    /**
     * Base color of the asteroids
     * @default "#888888"
     */
    color?: string;

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
 * AsteroidField - Canvas-based parallax asteroid belt with polygonal rocks of varying depth
 */
export const AsteroidField = memo(function AsteroidField({
    count = 80,
    speed = 1,
    color = '#888888',
    className,
    style,
}: AsteroidFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

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
            return [136, 136, 136];
        };
        const [r, g, b] = parseColor(color);

        interface Asteroid {
            x: number;
            y: number;
            radius: number;
            sides: number;          // number of polygon vertices
            wobble: number[];       // per-vertex radius variation (0.7–1.3)
            vx: number;             // horizontal velocity
            vy: number;             // vertical velocity
            rotation: number;
            rotationSpeed: number;
            depth: number;          // 0 = near, 1 = far
            opacity: number;
        }

        let asteroids: Asteroid[] = [];

        const createAsteroid = (x?: number, y?: number): Asteroid => {
            const depth = Math.random();
            const radius = 2 + (1 - depth) * 18; // near = large, far = small
            const sides = 5 + Math.floor(Math.random() * 5); // 5–9 sides
            return {
                x: x ?? Math.random() * (canvas.width ?? 800),
                y: y ?? Math.random() * (canvas.height ?? 600),
                radius,
                sides,
                wobble: Array.from({ length: sides }, () => 0.65 + Math.random() * 0.7),
                vx: (0.1 + (1 - depth) * 0.8) * speed * (Math.random() > 0.5 ? 1 : -1),
                vy: (0.02 + (1 - depth) * 0.15) * speed * (Math.random() > 0.7 ? 1 : -1),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() * 0.008 - 0.004) * (1 - depth + 0.3),
                depth,
                opacity: 0.25 + (1 - depth) * 0.7,
            };
        };

        const init = () => {
            asteroids = Array.from({ length: count }, () => createAsteroid());
        };

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            init();
        };
        resize();
        window.addEventListener('resize', resize);

        const drawAsteroid = (a: Asteroid) => {
            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.rotate(a.rotation);

            const depthBright = 0.5 + (1 - a.depth) * 0.5;
            const cr = Math.floor(r * depthBright);
            const cg = Math.floor(g * depthBright);
            const cb = Math.floor(b * depthBright);

            ctx.beginPath();
            for (let i = 0; i < a.sides; i++) {
                const angle = (i / a.sides) * Math.PI * 2;
                const rad = a.radius * a.wobble[i];
                const px = Math.cos(angle) * rad;
                const py = Math.sin(angle) * rad;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Fill with subtle gradient for 3D feel
            const grad = ctx.createRadialGradient(-a.radius * 0.25, -a.radius * 0.25, 0, 0, 0, a.radius);
            grad.addColorStop(0, `rgba(${Math.min(cr + 60, 255)},${Math.min(cg + 60, 255)},${Math.min(cb + 60, 255)},${a.opacity})`);
            grad.addColorStop(1, `rgba(${Math.max(cr - 40, 0)},${Math.max(cg - 40, 0)},${Math.max(cb - 40, 0)},${a.opacity * 0.6})`);
            ctx.fillStyle = grad;
            ctx.fill();

            // Thin rim
            ctx.strokeStyle = `rgba(${Math.min(cr + 80, 255)},${Math.min(cg + 80, 255)},${Math.min(cb + 80, 255)},${a.opacity * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            ctx.restore();
        };

        const draw = () => {
            const { width, height } = canvas;

            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(0, 0, width, height);

            // Sort by depth (far first, near on top)
            asteroids.sort((a, b) => b.depth - a.depth);

            for (const a of asteroids) {
                a.x += a.vx * speed;
                a.y += a.vy * speed;
                a.rotation += a.rotationSpeed * speed;

                // Wrap around edges (with margin for large asteroids)
                const margin = a.radius * 2;
                if (a.x < -margin) a.x = width + margin;
                else if (a.x > width + margin) a.x = -margin;
                if (a.y < -margin) a.y = height + margin;
                else if (a.y > height + margin) a.y = -margin;

                drawAsteroid(a);
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [count, speed, color]);

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

export default AsteroidField;
