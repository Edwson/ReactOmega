'use client';

import { useRef, memo } from 'react';
import { cn } from '../../utils/cn';

export interface WaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Color of the ripple wave
     * @default "rgba(255,255,255,0.4)"
     */
    waveColor?: string;

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
 * WaveButton - Button with a click-origin ripple wave animation.
 * Tracks click position via useRef; ripple is driven by a pure CSS keyframe animation.
 *
 * @example
 * ```tsx
 * <WaveButton waveColor="rgba(99,102,241,0.5)" onClick={handleClick}>
 *   Launch
 * </WaveButton>
 * ```
 */
export const WaveButton = memo(function WaveButton({
    children,
    className,
    style,
    waveColor = 'rgba(255,255,255,0.4)',
    onClick,
    ...props
}: WaveButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleContainerRef = useRef<HTMLSpanElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = buttonRef.current;
        const container = rippleContainerRef.current;
        if (!button || !container) return;

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Determine ripple size: must reach all corners from click point
        const maxDist = Math.max(
            Math.hypot(x, y),
            Math.hypot(rect.width - x, y),
            Math.hypot(x, rect.height - y),
            Math.hypot(rect.width - x, rect.height - y)
        );
        const diameter = maxDist * 2;

        // Create ripple element
        const ripple = document.createElement('span');
        ripple.style.cssText = `
      position: absolute;
      left: ${x - diameter / 2}px;
      top: ${y - diameter / 2}px;
      width: ${diameter}px;
      height: ${diameter}px;
      border-radius: 50%;
      background: ${waveColor};
      transform: scale(0);
      animation: wave-button-ripple 600ms ease-out forwards;
      pointer-events: none;
    `;

        container.appendChild(ripple);

        // Remove after animation completes
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });

        onClick?.(e);
    };

    return (
        <>
            {/* Keyframe definition — injected once, scoped by unique name */}
            <style>{`
        @keyframes wave-button-ripple {
          from {
            transform: scale(0);
            opacity: 1;
          }
          to {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>

            <button
                ref={buttonRef}
                className={cn(
                    'relative overflow-hidden inline-flex items-center justify-center',
                    'px-6 py-3 rounded-xl',
                    'bg-white/10 border border-white/20',
                    'text-white font-medium text-sm',
                    'backdrop-blur-sm',
                    'transition-colors duration-200',
                    'hover:bg-white/15 hover:border-white/30',
                    'active:bg-white/20',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                    'cursor-pointer select-none',
                    className
                )}
                style={style}
                onClick={handleClick}
                {...props}
            >
                {/* Ripple container */}
                <span
                    ref={rippleContainerRef}
                    className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none"
                    aria-hidden="true"
                />
                {/* Button label */}
                <span className="relative z-10">{children}</span>
            </button>
        </>
    );
});

export default WaveButton;
