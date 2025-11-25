'use client';

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface GlitchTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    /**
     * Text content
     */
    text: string;

    /**
     * Color of the glitch effect
     * @default "#00ffff"
     */
    glitchColor?: string;

    /**
     * Secondary glitch color
     * @default "#ff00ff"
     */
    glitchColor2?: string;

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
 * GlitchText - A premium text component with digital glitch effects
 */
export const GlitchText = memo(function GlitchText({
    text,
    glitchColor = '#00ffff',
    glitchColor2 = '#ff00ff',
    className,
    style,
    ...props
}: GlitchTextProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const triggerGlitch = () => {
            setIsGlitching(true);
            setTimeout(() => setIsGlitching(false), 200);
        };

        // Initial glitch
        const initialTimeout = setTimeout(triggerGlitch, 500);

        // Random intervals
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                triggerGlitch();
            }
        }, 2000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [isMounted]);

    if (!isMounted) {
        return (
            <span className={cn('relative inline-block font-bold', className)} style={style} {...props}>
                {text}
            </span>
        );
    }

    return (
        <span
            className={cn('relative inline-block font-bold overflow-hidden', className)}
            style={style}
            onMouseEnter={() => setIsGlitching(true)}
            {...props}
        >
            <span className="relative z-10">{text}</span>

            <AnimatePresence>
                {isGlitching && (
                    <>
                        <motion.span
                            className="absolute top-0 left-0 z-0 opacity-100 mix-blend-screen"
                            initial={{ x: 0 }}
                            animate={{ x: [-5, 5, -2, 0] }}
                            exit={{ x: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                color: glitchColor,
                                clipPath: 'inset(0 0 50% 0)'
                            }}
                            aria-hidden="true"
                        >
                            {text}
                        </motion.span>
                        <motion.span
                            className="absolute top-0 left-0 z-0 opacity-100 mix-blend-screen"
                            initial={{ x: 0 }}
                            animate={{ x: [5, -5, 2, 0] }}
                            exit={{ x: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                color: glitchColor2,
                                clipPath: 'inset(50% 0 0 0)'
                            }}
                            aria-hidden="true"
                        >
                            {text}
                        </motion.span>
                    </>
                )}
            </AnimatePresence>
        </span>
    );
});

export default GlitchText;
