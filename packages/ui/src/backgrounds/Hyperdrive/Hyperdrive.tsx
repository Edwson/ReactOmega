'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface HyperdriveProps {
    /**
     * Animation speed multiplier
     * @default 1
     */
    speed?: number;

    /**
     * Number of stars in the field
     * @default 500
     */
    starCount?: number;

    /**
     * Color of the stars
     * @default "#ffffff"
     */
    starColor?: string;

    /**
     * Length of star trails (0-1)
     * @default 0.5
     */
    trailLength?: number;

    /**
     * Direction of travel
     * @default "forward"
     */
    direction?: 'forward' | 'backward';

    /**
     * Enable mouse interaction
     * @default false
     */
    interactive?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;
}

interface Star {
    x: number;
    y: number;
    z: number;
    pz: number;
}

/**
 * Hyperdrive - Warp speed / hyperspace travel effect
 *
 * Creates an immersive starfield animation that simulates
 * traveling at warp speed through space.
 */
export const Hyperdrive = memo(function Hyperdrive({
    speed = 1,
    starCount = 500,
    starColor = '#ffffff',
    trailLength = 0.5,
    direction = 'forward',
    interactive = false,
    className,
    style,
}: HyperdriveProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const starsRef = useRef<Star[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const centerRef = useRef({ x: 0, y: 0 });

    // Initialize stars
    useEffect(() => {
        const stars: Star[] = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * 2000 - 1000,
                y: Math.random() * 2000 - 1000,
                z: Math.random() * 1000,
                pz: 0,
            });
        }
        starsRef.current = stars;
    }, [starCount]);

    // Handle resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                centerRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Handle mouse interaction
    useEffect(() => {
        if (!interactive) return;

        const handleMouseMove = (e: MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate offset from center
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            mouseRef.current = {
                x: (x - centerX) * 0.5, // Dampen the effect
                y: (y - centerY) * 0.5
            };
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [interactive]);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            // Clear canvas with fade effect for trails
            ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Fully clear for now, trails handled by drawing lines
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = centerRef.current.x + (interactive ? mouseRef.current.x : 0);
            const cy = centerRef.current.y + (interactive ? mouseRef.current.y : 0);

            const stars = starsRef.current;
            const speedMult = direction === 'forward' ? speed : -speed;

            ctx.strokeStyle = starColor;
            ctx.lineCap = 'round';

            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];

                // Update star position
                star.z -= speedMult * 10;

                // Reset star if it goes past camera or too far
                if (star.z <= 0) {
                    star.x = Math.random() * 2000 - 1000;
                    star.y = Math.random() * 2000 - 1000;
                    star.z = 1000;
                    star.pz = 1000;
                } else if (star.z > 1000) {
                    star.x = Math.random() * 2000 - 1000;
                    star.y = Math.random() * 2000 - 1000;
                    star.z = 1;
                    star.pz = 1;
                }

                // Project star
                const x = (star.x / star.z) * canvas.width * 0.5;
                const y = (star.y / star.z) * canvas.height * 0.5;

                // Calculate previous position for trail
                // We use pz to track where it was, but for smooth trails we can just use a slightly larger z
                // Or we can store the previous projected position.
                // Let's use a simple projection of a point slightly further back in Z

                const trailZ = star.z + (speedMult * 10 * trailLength * 5); // Adjust trail length
                const tx = (star.x / trailZ) * canvas.width * 0.5;
                const ty = (star.y / trailZ) * canvas.height * 0.5;

                const sx = cx + x;
                const sy = cy + y;

                const ex = cx + tx;
                const ey = cy + ty;

                // Draw star trail
                // Opacity based on Z (closer = brighter)
                const opacity = 1 - star.z / 1000;
                const size = (1 - star.z / 1000) * 3;

                if (sx >= 0 && sx <= canvas.width && sy >= 0 && sy <= canvas.height) {
                    ctx.lineWidth = size;
                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();
                }

                star.pz = star.z;
            }

            ctx.globalAlpha = 1.0;
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [speed, starColor, trailLength, direction, interactive]);

    return (
        <canvas
            ref={canvasRef}
            className={cn(
                'absolute inset-0 w-full h-full pointer-events-none z-0',
                interactive && 'pointer-events-auto',
                className
            )}
            style={style}
            aria-hidden="true"
        />
    );
});

export default Hyperdrive;
