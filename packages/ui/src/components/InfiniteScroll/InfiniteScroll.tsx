'use client';

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface InfiniteScrollProps {
    /**
     * Content to scroll. Duplicated internally for seamless looping.
     */
    children: React.ReactNode;

    /**
     * Scroll direction
     * @default "horizontal"
     */
    direction?: 'horizontal' | 'vertical';

    /**
     * Animation speed in pixels per second
     * @default 30
     */
    speed?: number;

    /**
     * Pause the marquee on hover
     * @default true
     */
    pauseOnHover?: boolean;

    /**
     * Additional CSS classes for the outer wrapper
     */
    className?: string;

    /**
     * Additional inline styles for the outer wrapper
     */
    style?: React.CSSProperties;
}

/**
 * InfiniteScroll - Seamless marquee/ticker using pure CSS animation.
 * Duplicates children to create a seamless loop; no JS position tracking required.
 *
 * @example
 * ```tsx
 * <InfiniteScroll speed={40} pauseOnHover>
 *   {items.map(item => <Tag key={item}>{item}</Tag>)}
 * </InfiniteScroll>
 * ```
 */
export const InfiniteScroll = memo(function InfiniteScroll({
    children,
    direction = 'horizontal',
    speed = 30,
    pauseOnHover = true,
    className,
    style,
}: InfiniteScrollProps) {
    const isHorizontal = direction === 'horizontal';

    // CSS animation duration: we use a 200px reference distance and scale by speed.
    // The keyframe is defined inline via a style tag so we can parameterize the
    // translation without JS intervention on each frame.
    const animationName = isHorizontal ? 'infinite-scroll-x' : 'infinite-scroll-y';
    const durationSeconds = 200 / speed; // higher speed → shorter duration

    return (
        <div
            className={cn(
                'overflow-hidden',
                isHorizontal ? 'flex flex-row' : 'flex flex-col',
                className
            )}
            style={style}
        >
            {/* Inline keyframes — scoped to the component instance via animationName */}
            <style>{`
        @keyframes infinite-scroll-x {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes infinite-scroll-y {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
      `}</style>

            <div
                className={cn(
                    'flex shrink-0',
                    isHorizontal ? 'flex-row' : 'flex-col'
                )}
                style={{
                    animationName,
                    animationDuration: `${durationSeconds}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationPlayState: 'running',
                }}
                onMouseEnter={
                    pauseOnHover
                        ? (e) => {
                              (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused';
                          }
                        : undefined
                }
                onMouseLeave={
                    pauseOnHover
                        ? (e) => {
                              (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running';
                          }
                        : undefined
                }
            >
                {/* First copy */}
                <div className={cn('flex shrink-0', isHorizontal ? 'flex-row items-center gap-4' : 'flex-col items-center gap-4')}>
                    {children}
                </div>
                {/* Duplicate copy for seamless loop */}
                <div
                    className={cn('flex shrink-0', isHorizontal ? 'flex-row items-center gap-4' : 'flex-col items-center gap-4')}
                    aria-hidden="true"
                >
                    {children}
                </div>
            </div>
        </div>
    );
});

export default InfiniteScroll;
