'use client';

import { useRef, useState, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../utils/cn';

import { HTMLMotionProps } from 'framer-motion';

export interface TiltedCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: React.ReactNode;
    /**
     * Maximum tilt angle in degrees
     * @default 20
     */
    maxTilt?: number;

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
 * TiltedCard - A card with 3D tilt effect on hover
 */
export const TiltedCard = memo(function TiltedCard({
    children,
    maxTilt = 20,
    className,
    style,
    ...props
}: TiltedCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;

        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className={cn(
                'relative rounded-xl bg-gray-900 border border-white/10 p-6',
                className
            )}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                ...style,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            {...props as any}
        >
            <div style={{ transform: 'translateZ(50px)' }}>
                {children}
            </div>
        </motion.div>
    );
});

export default TiltedCard;
