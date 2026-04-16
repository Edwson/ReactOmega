'use client';

import { memo } from 'react';
import { cn } from '../../utils/cn';

// ─── BentoItem ───────────────────────────────────────────────────────────────

export interface BentoItemProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Number of grid columns this item should span
     * @default 1
     */
    colSpan?: number;

    /**
     * Number of grid rows this item should span
     * @default 1
     */
    rowSpan?: number;

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * BentoItem - A single cell inside a BentoGrid with optional col/row spanning and glassmorphism styling
 */
export const BentoItem = memo(function BentoItem({
    colSpan = 1,
    rowSpan = 1,
    className,
    children,
    style,
    ...props
}: BentoItemProps) {
    return (
        <div
            className={cn(
                // Glassmorphism card base
                'relative overflow-hidden rounded-2xl',
                'bg-white/5 border border-white/10',
                'backdrop-blur-sm',
                'transition-all duration-300',
                'hover:bg-white/8 hover:border-white/20 hover:shadow-lg hover:shadow-white/5',
                className
            )}
            style={{
                gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
                gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
                ...style,
            }}
            {...props}
        >
            {/* Subtle inner glow overlay */}
            <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                    background:
                        'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)',
                }}
                aria-hidden="true"
            />
            <div className="relative z-10 h-full">{children}</div>
        </div>
    );
});

// ─── BentoGrid ───────────────────────────────────────────────────────────────

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Number of columns in the grid
     * @default 3
     */
    columns?: number;

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
 * BentoGrid - CSS Grid layout for irregular Bento-box style feature cards
 *
 * @example
 * ```tsx
 * <BentoGrid columns={3}>
 *   <BentoItem colSpan={2} rowSpan={2}>Hero card</BentoItem>
 *   <BentoItem>Small card</BentoItem>
 *   <BentoItem>Small card</BentoItem>
 * </BentoGrid>
 * ```
 */
export const BentoGrid = memo(function BentoGrid({
    columns = 3,
    className,
    children,
    style,
    ...props
}: BentoGridProps) {
    return (
        <div
            className={cn('grid gap-4 w-full', className)}
            style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gridAutoRows: 'minmax(120px, auto)',
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
});

export default BentoGrid;
