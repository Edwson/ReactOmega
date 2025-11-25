'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface ShootingStarsProps {
    /**
     * Color of the stars
     * @default "#ffffff"
     */
    starColor?: string;

    /**
     * Color of the trail
     * @default "rgba(255, 255, 255, 0.2)"
     */
    trailColor?: string;

    /**
     * Minimum speed
     * @default 10
     */
    minSpeed?: number;

    /**
     * Maximum speed
     * @default 30
     */
    maxSpeed?: number;

    /**
     * Minimum delay between stars (ms)
     * @default 1000
     */
    minDelay?: number;

    /**
     * Maximum delay between stars (ms)
     * @default 3000
     */
    maxDelay?: number;

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
    length: number;
    speed: number;
    angle: number;
    opacity: number;
    distance: number;
}

/**
 * ShootingStars - Random shooting stars effect
 */
export const ShootingStars = memo(function ShootingStars({
    starColor = '#ffffff',
    trailColor = 'rgba(255, 255, 255, 0.2)',
    minSpeed = 10,
    maxSpeed = 30,
    minDelay = 1000,
    maxDelay = 3000,
    className,
    style,
}: ShootingStarsProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const starsRef = useRef<Star[]>([]);
    const timeoutRef = useRef<any>(null);

    const createStar = (canvas: HTMLCanvasElement): Star => {
        const angle = Math.PI / 4; // 45 degrees
        const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

        // Start from top or left
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() * canvas.width;
            y = 0;
        } else {
            x = 0;
            y = Math.random() * canvas.height;
        }

        return {
            x,
            y,
            length: Math.random() * 80 + 20,
            speed,
            angle,
            opacity: 1,
            distance: 0,
        };
    };

    const scheduleNextStar = (canvas: HTMLCanvasElement) => {
        const delay = Math.random() * (maxDelay - minDelay) + minDelay;
        timeoutRef.current = setTimeout(() => {
            starsRef.current.push(createStar(canvas));
            scheduleNextStar(canvas);
        }, delay);
    };

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

        // Initial star
        scheduleNextStar(canvas);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [minDelay, maxDelay, minSpeed, maxSpeed]);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const stars = starsRef.current;

            for (let i = stars.length - 1; i >= 0; i--) {
                const star = stars[i];

                // Update position
                star.x += Math.cos(star.angle) * star.speed;
                star.y += Math.sin(star.angle) * star.speed;
                star.distance += star.speed;

                // Fade out
                if (star.distance > star.length) {
                    star.opacity -= 0.05;
                }

                // Remove if invisible or out of bounds
                if (star.opacity <= 0 || star.x > canvas.width || star.y > canvas.height) {
                    stars.splice(i, 1);
                    continue;
                }

                // Draw trail
                const tailX = star.x - Math.cos(star.angle) * star.length;
                const tailY = star.y - Math.sin(star.angle) * star.length;

                const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
                gradient.addColorStop(0, starColor);
                gradient.addColorStop(1, 'transparent');

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.globalAlpha = star.opacity;

                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(tailX, tailY);
                ctx.stroke();
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
    }, [starColor, trailColor]);

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

export default ShootingStars;
