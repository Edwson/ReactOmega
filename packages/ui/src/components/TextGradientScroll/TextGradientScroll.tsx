'use client';

import { useRef, memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TextGradientScrollProps {
    /**
     * Text content
     */
    text: string;

    /**
     * Start color of the gradient
     * @default "#ffffff"
     */
    startColor?: string;

    /**
     * End color of the gradient
     * @default "#666666"
     */
    endColor?: string;

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
 * TextGradientScroll - Text that reveals a gradient based on scroll position
 */
export const TextGradientScroll = memo(function TextGradientScroll({
    text,
    startColor = '#ffffff',
    endColor = '#666666',
    className,
    style,
}: TextGradientScrollProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

    return (
        <motion.div
            ref={ref}
            className={cn(
                'text-4xl md:text-6xl font-bold text-center py-20',
                className
            )}
            style={{
                opacity,
                scale,
                ...style,
            }}
        >
            <span
                className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
                style={{
                    backgroundImage: `linear-gradient(to bottom, ${startColor}, ${endColor})`,
                }}
            >
                {text}
            </span>
        </motion.div>
    );
});

export default TextGradientScroll;
