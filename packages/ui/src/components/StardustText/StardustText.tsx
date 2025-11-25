'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface StardustTextProps {
    /**
     * Text content
     */
    text: string;

    /**
     * Font size
     * @default 48
     */
    fontSize?: number;

    /**
     * Font family
     * @default "Arial"
     */
    fontFamily?: string;

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
    originX: number;
    originY: number;
    color: string;
    size: number;
    vx: number;
    vy: number;
    ease: number;
}

/**
 * StardustText - Text made of particles that react to mouse
 */
export const StardustText = memo(function StardustText({
    text,
    fontSize = 48,
    fontFamily = 'Arial',
    className,
    style,
}: StardustTextProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0, radius: 100 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            canvas.width = rect.width;
            canvas.height = rect.height;
        }

        // Draw text to get particle positions
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const particles: Particle[] = [];

        for (let y = 0; y < canvas.height; y += 4) {
            for (let x = 0; x < canvas.width; x += 4) {
                const index = (y * canvas.width + x) * 4;
                const alpha = imageData.data[index + 3];

                if (alpha > 0) {
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        originX: x,
                        originY: y,
                        color: 'white',
                        size: Math.random() * 2 + 1,
                        vx: 0,
                        vy: 0,
                        ease: Math.random() * 0.1 + 0.05,
                    });
                }
            }
        }

        particlesRef.current = particles;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;

                if (distance < mouse.radius) {
                    const directionX = forceDirectionX * force * 5;
                    const directionY = forceDirectionY * force * 5;
                    p.vx -= directionX;
                    p.vy -= directionY;
                }

                const dxOrigin = p.originX - p.x;
                const dyOrigin = p.originY - p.y;

                p.vx += dxOrigin * p.ease;
                p.vy += dyOrigin * p.ease;
                p.vx *= 0.95; // Friction
                p.vy *= 0.95;

                p.x += p.vx;
                p.y += p.vy;

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [text, fontSize, fontFamily]);

    return (
        <canvas
            ref={canvasRef}
            className={cn('w-full h-full', className)}
            style={style}
        />
    );
});

export default StardustText;
