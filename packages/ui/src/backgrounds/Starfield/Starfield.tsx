'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface StarfieldProps {
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
     * Background color
     * @default "transparent"
     */
    backgroundColor?: string;

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
    size: number;
    opacity: number;
    speed: number;
}

/**
 * Starfield - Static or animated star background with twinkling
 */
export const Starfield = memo(function Starfield({
    speed = 1,
    starCount = 500,
    starColor = '#ffffff',
    backgroundColor = 'transparent',
    className,
    style,
}: StarfieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const starsRef = useRef<Star[]>([]);

    // Initialize stars
    useEffect(() => {
        const stars: Star[] = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 2,
                opacity: Math.random(),
                speed: Math.random() * 0.05 + 0.01,
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
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (backgroundColor !== 'transparent') {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const stars = starsRef.current;
            ctx.fillStyle = starColor;

            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];

                // Twinkle effect
                star.opacity += star.speed * speed * (Math.random() > 0.5 ? 1 : -1);

                if (star.opacity < 0) star.opacity = 0;
                if (star.opacity > 1) star.opacity = 1;

                ctx.globalAlpha = star.opacity;
                ctx.beginPath();
                ctx.arc(
                    star.x * canvas.width,
                    star.y * canvas.height,
                    star.size,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
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
    }, [speed, starColor, backgroundColor]);

    return (
        <canvas
            ref={canvasRef}
            className={cn(
                'absolute inset-0 w-full h-full pointer-events-none z-0',
                className
            )}
            style={style}
            aria-hidden="true"
        />
    );
});

export default Starfield;
