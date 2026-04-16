'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface CosmicDustProps {
    /**
     * Number of particles
     * @default 100
     */
    particleCount?: number;

    /**
     * Color of the particles
     * @default "#ffffff"
     */
    particleColor?: string;

    /**
     * Base speed of particles
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

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
}

/**
 * CosmicDust - Floating cosmic dust particles
 */
export const CosmicDust = memo(function CosmicDust({
    particleCount = 100,
    particleColor = '#ffffff',
    speed = 1,
    className,
    style,
}: CosmicDustProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const particlesRef = useRef<Particle[]>([]);

    // Initialize particles
    useEffect(() => {
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.001,
                speedY: (Math.random() - 0.5) * 0.001,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }
        particlesRef.current = particles;
    }, [particleCount]);

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
<<<<<<< HEAD
=======
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            ctx.fillStyle = particleColor;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Update position
                p.x += p.speedX * speed;
                p.y += p.speedY * speed;

                // Wrap around
                if (p.x < 0) p.x = 1;
                if (p.x > 1) p.x = 0;
                if (p.y < 0) p.y = 1;
                if (p.y > 1) p.y = 0;

                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(
                    p.x * canvas.width,
                    p.y * canvas.height,
                    p.size,
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
    }, [speed, particleColor]);

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

export default CosmicDust;
