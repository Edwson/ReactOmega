'use client';

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface CosmicButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'formAction'> {
    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;

    /**
     * Form action handler (React 19 compatible)
     */
    formAction?: string | ((formData: FormData) => void | Promise<void>);
}

/**
 * CosmicButton - Button with stardust hover/click effects
 */
export const CosmicButton = memo(function CosmicButton({
    children,
    className,
    style,
    formAction,
    ...props
}: CosmicButtonProps) {
    return (
        <button
            className={cn(
                'relative group px-8 py-4 bg-black text-white font-bold rounded-full overflow-hidden transition-transform active:scale-95',
                className
            )}
            style={style}
            formAction={formAction as any}
            {...props}
        >
            {/* Gradient Border */}
            <div className="absolute inset-0 p-[1px] rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            {/* Stardust Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '1s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }} />
                <div className="absolute top-1/2 right-10 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />
            </div>

            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </button>
    );
});

export default CosmicButton;
