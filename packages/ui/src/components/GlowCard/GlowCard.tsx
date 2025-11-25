'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Color of the glow
     * @default "#ffffff"
     */
    glowColor?: string;

    /**
     * Hue of the glow (0-360) - overrides glowColor if set
     */
    hue?: number;

    /**
     * Size of the glow effect
     * @default 300
     */
    size?: number;

    /**
     * Border radius
     * @default 16
     */
    borderRadius?: number;
}

/**
 * GlowCard - Card with mouse-following glow effect
 */
export const GlowCard = memo(function GlowCard({
    children,
    className,
    glowColor = '#ffffff',
    hue,
    size = 300,
    borderRadius = 16,
    style,
    ...props
}: GlowCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };

        card.addEventListener('mousemove', handleMouseMove);
        return () => card.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={cardRef}
            className={cn(
                'relative group overflow-hidden bg-white/5 border border-white/10',
                className
            )}
            style={{
                borderRadius,
                '--glow-color': hue ? `hsl(${hue}, 100%, 50%)` : glowColor,
                '--glow-size': `${size}px`,
                ...style,
            } as React.CSSProperties}
            {...props}
        >
            {/* Glow Effect */}
            <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(
            var(--glow-size) circle at var(--mouse-x) var(--mouse-y),
            var(--glow-color),
            transparent 100%
          )`,
                    mixBlendMode: 'screen',
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
});

export default GlowCard;
