'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface HolographicCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
 * HolographicCard - 3D tilt effect with holographic sheen
 */
export const HolographicCard = memo(function HolographicCard({
    children,
    className,
    style,
    ...props
}: HolographicCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.setProperty('--rotate-x', `${rotateX}deg`);
            card.style.setProperty('--rotate-y', `${rotateY}deg`);
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        };

        const handleMouseLeave = () => {
            card.style.setProperty('--rotate-x', '0deg');
            card.style.setProperty('--rotate-y', '0deg');
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div
            className={cn('perspective-1000', className)}
<<<<<<< HEAD
            style={style}
=======
            style={{ willChange: 'transform', ...style }}
>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
            {...props}
        >
            <div
                ref={cardRef}
                className="relative transform-style-3d transition-transform duration-200 ease-out will-change-transform"
                style={{
                    transform: 'perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))',
                }}
            >
                {/* Content Container */}
                <div className="relative z-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    {children}

                    {/* Holographic Sheen */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay"
                        style={{
                            background: `
                linear-gradient(
                  105deg,
                  transparent 20%,
                  rgba(255, 255, 255, 0.1) 25%,
                  rgba(255, 0, 150, 0.1) 30%,
                  rgba(0, 255, 255, 0.1) 35%,
                  rgba(255, 255, 255, 0.1) 40%,
                  transparent 45%
                )
              `,
                            backgroundSize: '200% 200%',
                            backgroundPosition: 'var(--mouse-x, 50%) var(--mouse-y, 50%)',
                            filter: 'brightness(1.2) contrast(1.2)',
                        }}
                    />

                    {/* Shine */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `radial-gradient(
                circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                rgba(255, 255, 255, 0.1) 0%,
                transparent 50%
              )`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
});

export default HolographicCard;
