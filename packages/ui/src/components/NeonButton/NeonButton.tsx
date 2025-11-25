'use client';

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    neonColor?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const NeonButton = memo(function NeonButton({
    children,
    neonColor = '#00ffff',
    className,
    style,
    ...props
}: NeonButtonProps) {
    return (
        <button
            className={cn(
                'relative px-8 py-4 font-bold text-white bg-transparent border-2 rounded-lg',
                'transition-all duration-300',
                'hover:scale-105',
                'animate-pulse-glow',
                className
            )}
            style={{
                borderColor: neonColor,
                color: neonColor,
                textShadow: `0 0 10px ${neonColor}, 0 0 20px ${neonColor}`,
                boxShadow: `0 0 10px ${neonColor}, 0 0 20px ${neonColor}, inset 0 0 10px ${neonColor}33`,
                ...style,
            }}
            {...props}
        >
            <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
            {children}
        </button>
    );
});

export default NeonButton;
