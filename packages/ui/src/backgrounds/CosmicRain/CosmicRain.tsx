'use client';

import { useRef, useEffect, memo } from 'react';
import { cn } from '../../utils/cn';

export interface CosmicRainProps {
    count?: number;
    color?: string;
    speed?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const CosmicRain = memo(function CosmicRain({
    count = 50,
    color = '#00ffff',
    speed = 1,
    className,
    style,
}: CosmicRainProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d')!;
        let animationId: number;
        const drops: Array<{ x: number; y: number; length: number; speed: number; opacity: number }> = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initDrops();
        };

        const initDrops = () => {
            drops.length = 0;
            for (let i = 0; i < count; i++) {
                drops.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height - canvas.height,
                    length: Math.random() * 100 + 50,
                    speed: (Math.random() * 2 + 1) * speed,
                    opacity: Math.random() * 0.5 + 0.5,
                });
            }
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drops.forEach((drop) => {
                drop.y += drop.speed;

                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }

                const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, 'transparent');

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.globalAlpha = drop.opacity;
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.stroke();
            });

            ctx.globalAlpha = 1;
            animationId = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [count, color, speed]);

    return (
        <canvas
            ref={canvasRef}
            className={cn('absolute inset-0 w-full h-full pointer-events-none z-0', className)}
            style={style}
            aria-hidden="true"
        />
    );
});

export default CosmicRain;
