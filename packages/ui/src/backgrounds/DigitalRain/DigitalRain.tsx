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
<<<<<<< HEAD
=======
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let lastTime = 0;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&*';
        const columns: number[] = [];

        const resize = () => {
<<<<<<< HEAD
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            const columnCount = Math.floor(canvas.width / fontSize);
            columns.length = 0;
            for (let i = 0; i < columnCount; i++) {
                columns[i] = Math.random() * canvas.height;
=======
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);

            const columnCount = Math.floor(canvas.offsetWidth / fontSize);
            columns.length = 0;
            for (let i = 0; i < columnCount; i++) {
                columns[i] = Math.random() * canvas.offsetHeight;
>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const draw = (timestamp: number) => {
            const deltaTime = timestamp - lastTime;

            // Limit frame rate for style and performance
            if (deltaTime > 33 / speed) {
                lastTime = timestamp;

<<<<<<< HEAD
                // Fade effect
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
=======
                // Fade effect — use logical dimensions (offsetWidth/Height) since ctx is scaled by dpr
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)

                ctx.fillStyle = color;
                ctx.font = `${fontSize}px monospace`;

                for (let i = 0; i < columns.length; i++) {
                    const char = characters[Math.floor(Math.random() * characters.length)];
                    const x = i * fontSize;
                    const y = columns[i] * fontSize;

                    ctx.fillText(char, x, y);

<<<<<<< HEAD
                    if (y > canvas.height && Math.random() > 0.975) {
=======
                    if (y > canvas.offsetHeight && Math.random() > 0.975) {
>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
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
