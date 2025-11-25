'use client';

import { useRef, useEffect, memo } from 'react';
import { cn } from '../../utils/cn';

export interface MeteorProps {
    count?: number;
    speed?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const Meteor = memo(function Meteor({
    count = 10,
    speed = 1,
    color = '#ffaa00',
    className,
    style,
}: MeteorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d')!;
        let animationId: number;
        let meteors: Array<{
            x: number;
            y: number;
            length: number;
            speed: number;
            angle: number;
            opacity: number;
        }> = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const createMeteor = () => {
            return {
                x: Math.random() * canvas.width,
                y: -50,
                length: Math.random() * 80 + 40,
                speed: (Math.random() * 3 + 2) * speed,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.5,
            };
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add new meteors randomly
            if (meteors.length < count && Math.random() < 0.03) {
                meteors.push(createMeteor());
            }

            meteors.forEach((meteor, index) => {
                meteor.x += Math.cos(meteor.angle) * meteor.speed;
                meteor.y += Math.sin(meteor.angle) * meteor.speed;

                // Draw meteor trail
                const gradient = ctx.createLinearGradient(
                    meteor.x,
                    meteor.y,
                    meteor.x - Math.cos(meteor.angle) * meteor.length,
                    meteor.y - Math.sin(meteor.angle) * meteor.length
                );
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, 'transparent');

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
                ctx.globalAlpha = meteor.opacity;
                ctx.beginPath();
                ctx.moveTo(meteor.x, meteor.y);
                ctx.lineTo(
                    meteor.x - Math.cos(meteor.angle) * meteor.length,
                    meteor.y - Math.sin(meteor.angle) * meteor.length
                );
                ctx.stroke();

                // Draw meteor head glow
                const glowGradient = ctx.createRadialGradient(
                    meteor.x,
                    meteor.y,
                    0,
                    meteor.x,
                    meteor.y,
                    10
                );
                glowGradient.addColorStop(0, color);
                glowGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(meteor.x, meteor.y, 10, 0, Math.PI * 2);
                ctx.fill();

                // Remove meteors that are off screen
                if (meteor.y > canvas.height + 100 || meteor.x > canvas.width + 100) {
                    meteors.splice(index, 1);
                }
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

export default Meteor;
