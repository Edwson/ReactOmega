'use client';

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface StarBorderProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Color of the star/border
     * @default "#ffffff"
     */
    color?: string;

    /**
     * Animation speed (seconds)
     * @default 4
     */
    speed?: number;

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
 * StarBorder - Animated star/particle border effect
 */
export const StarBorder = memo(function StarBorder({
    children,
    className,
    color = '#ffffff',
    speed = 4,
    style,
    ...props
}: StarBorderProps) {
    return (
        <div
            className={cn('relative inline-block overflow-hidden rounded-xl', className)}
            style={style}
            {...props}
        >
            {/* Animated Border */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: `conic-gradient(from 0deg at 50% 50%, transparent 0%, ${color} 10%, transparent 20%)`,
                    animation: `star-border-rotate ${speed}s linear infinite`,
                }}
            />

            {/* Inner Content Mask */}
            <div className="relative z-10 m-[1px] rounded-[inherit] bg-black">
                {children}
            </div>

            <style>{`
        @keyframes star-border-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
});

export default StarBorder;
