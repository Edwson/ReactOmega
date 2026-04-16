'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface CardStackProps {
    /**
     * Array of React nodes, each rendered as a stacked card.
     * Index 0 is the top card.
     */
    cards: React.ReactNode[];

    /**
     * Vertical pixel offset between stacked cards
     * @default 10
     */
    offset?: number;

    /**
     * Scale reduction per card below the top
     * @default 0.06
     */
    scaleFactor?: number;

    /**
     * Additional CSS classes for the container
     */
    className?: string;

    /**
     * Additional inline styles for the container
     */
    style?: React.CSSProperties;
}

/**
 * CardStack - Layered card stack that fans open into a vertical spread on hover
 */
export const CardStack = memo(function CardStack({
    cards,
    offset = 10,
    scaleFactor = 0.06,
    className,
    style,
}: CardStackProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className={cn('relative w-full h-full', className)}
            style={style}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Render cards bottom-to-top so z-index is correct */}
            {[...cards].reverse().map((card, reversedIndex) => {
                // Convert reversed index back to natural index (0 = top)
                const index = cards.length - 1 - reversedIndex;
                const isTop = index === 0;

                const collapsedY = index * offset;
                const collapsedScale = 1 - index * scaleFactor;
                const expandedY = hovered ? index * (offset * 3.5) : collapsedY;
                const expandedScale = hovered ? 1 - index * (scaleFactor * 0.5) : collapsedScale;

                return (
                    <motion.div
                        key={index}
                        className={cn(
                            'absolute inset-0 w-full',
                            'rounded-2xl overflow-hidden',
                            'bg-white/5 border border-white/10',
                            'backdrop-blur-sm',
                            isTop && 'cursor-pointer'
                        )}
                        style={{
                            zIndex: cards.length - index,
                            transformOrigin: 'top center',
                        }}
                        animate={{
                            y: expandedY,
                            scale: expandedScale,
                            opacity: hovered ? 1 : 1 - index * 0.15,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 28,
                            delay: hovered ? index * 0.04 : (cards.length - 1 - index) * 0.04,
                        }}
                    >
                        {card}
                    </motion.div>
                );
            })}
        </div>
    );
});

export default CardStack;
