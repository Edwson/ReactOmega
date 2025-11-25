'use client';

import { useRef, useState, memo } from 'react';
import { cn } from '../../utils/cn';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Color of the spotlight
     * @default "rgba(255, 255, 255, 0.1)"
     */
    spotlightColor?: string;

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
 * SpotlightCard - Card with a mouse-following spotlight effect
 */
export const SpotlightCard = memo(function SpotlightCard({
    children,
    spotlightColor = 'rgba(255, 255, 255, 0.1)',
    className,
    style,
    ...props
}: SpotlightCardProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                'relative overflow-hidden rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm p-8',
                className
            )}
            style={style}
            {...props}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
});

export default SpotlightCard;
