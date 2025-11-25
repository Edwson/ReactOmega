'use client';

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    blur?: 'sm' | 'md' | 'lg';
    className?: string;
    style?: React.CSSProperties;
}

export const GlassCard = memo(function GlassCard({
    children,
    blur = 'md',
    className,
    style,
    ...props
}: GlassCardProps) {
    const blurMap = {
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
    };

    return (
        <div
            className={cn(
                'relative rounded-2xl border border-white/20 bg-white/10',
                blurMap[blur],
                'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
                'before:absolute before:inset-0 before:rounded-2xl before:p-[1px]',
                'before:bg-gradient-to-br before:from-white/40 before:to-transparent',
                'before:-z-10 before:blur-sm',
                className
            )}
            style={style}
            {...props}
        >
            <div className="relative z-10 p-6">{children}</div>
        </div>
    );
});

export default GlassCard;
