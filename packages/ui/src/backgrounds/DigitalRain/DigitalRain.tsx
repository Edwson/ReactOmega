'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface DigitalRainProps {
    /**
     * Color of the falling characters
     * @default "#00ff88"
     */
    color?: string;

    /**
     * Speed of the rain
     * @default 1
     */
    speed?: number;

    /**
     * Font size of the characters
     * @default 16
     */
    fontSize?: number;

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
 * DigitalRain - Matrix-style falling characters with a cosmic twist
 */
export const DigitalRain = memo(function DigitalRain({
    color = '#00ff88',
    speed = 1,
    fontSize = 16,
    className,
    style,
}: DigitalRainProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let lastTime = 0;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&*';
        const columns: number[] = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            const columnCount = Math.floor(canvas.width / fontSize);
            columns.length = 0;
            for (let i = 0; i < columnCount; i++) {
                columns[i] = Math.random() * canvas.height;
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const draw = (timestamp: number) => {
            const deltaTime = timestamp - lastTime;

            // Limit frame rate for style and performance
            if (deltaTime > 33 / speed) {
                lastTime = timestamp;

                // Fade effect
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = color;
                ctx.font = `${fontSize}px monospace`;

                for (let i = 0; i < columns.length; i++) {
                    const char = characters[Math.floor(Math.random() * characters.length)];
                    const x = i * fontSize;
                    const y = columns[i] * fontSize;

                    ctx.fillText(char, x, y);

                    if (y > canvas.height && Math.random() > 0.975) {
                        columns[i] = 0;
                    }

                    columns[i]++;
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, speed, fontSize]);

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

export default DigitalRain;
