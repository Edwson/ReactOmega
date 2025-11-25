'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

import { HTMLMotionProps } from 'framer-motion';

export interface ShinyButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: React.ReactNode;
    /**
     * Color of the button
     * @default "#8b5cf6"
     */
    color?: string;

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
 * ShinyButton - A button with a metallic/shiny sweep effect
 */
export const ShinyButton = memo(function ShinyButton({
    children,
    color = '#8b5cf6',
    className,
    style,
    ...props
}: ShinyButtonProps) {
    return (
        <motion.button
            className={cn(
                'relative px-8 py-3 rounded-lg font-bold text-white overflow-hidden group',
                className
            )}
            style={{
                background: color,
                ...style,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props as any}
        >
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite] z-10">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12" />
            </div>

            {/* Content */}
            <span className="relative z-20">{children}</span>

            <style>{`
                @keyframes shine {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </motion.button>
    );
});

export default ShinyButton;
