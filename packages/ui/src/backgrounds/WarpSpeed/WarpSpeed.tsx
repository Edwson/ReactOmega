'use client';

import { useRef, useEffect, memo } from 'react';
import { cn } from '../../utils/cn';

export interface WarpSpeedProps {
    count?: number;
    speed?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const WarpSpeed = memo(function WarpSpeed({
    count = 200,
    speed = 10,
    color = '#ffffff',
    className,
    style,
}: WarpSpeedProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d')!;
        let animationId: number;
        let stars: Array<{ x: number; y: number; z: number; prevZ: number }> = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initStars();
        };

        const initStars = () => {
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * canvas.width - canvas.width / 2,
                    y: Math.random() * canvas.height - canvas.height / 2,
                    z: Math.random() * canvas.width,
                    prevZ: 0,
                });
            }
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);

            stars.forEach((star) => {
                star.prevZ = star.z;
                star.z -= speed;

                if (star.z <= 0) {
                    star.x = Math.random() * canvas.width - canvas.width / 2;
                    star.y = Math.random() * canvas.height - canvas.height / 2;
                    star.z = canvas.width;
                    star.prevZ = star.z;
                }

                const sx = (star.x / star.z) * canvas.width;
                const sy = (star.y / star.z) * canvas.height;
                const prevSx = (star.x / star.prevZ) * canvas.width;
                const prevSy = (star.y / star.prevZ) * canvas.height;

                const size = (1 - star.z / canvas.width) * 3;

                ctx.strokeStyle = color;
                ctx.lineWidth = size;
                ctx.globalAlpha = 1 - star.z / canvas.width;
                ctx.beginPath();
                ctx.moveTo(prevSx, prevSy);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            });

            ctx.restore();
            animationId = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [count, speed, color]);

    return (
        <canvas
            ref={canvasRef}
            className={cn('absolute inset-0 w-full h-full pointer-events-none z-0', className)}
            style={style}
            aria-hidden="true"
        />
    );
});

export default WarpSpeed;
