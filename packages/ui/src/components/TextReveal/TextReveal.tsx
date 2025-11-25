'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { cn } from '../../utils/cn';

export interface TextRevealProps {
    /**
     * Text content
     */
    text: string;

    /**
     * Reveal speed (ms per character)
     * @default 50
     */
    speed?: number;

    /**
     * Character set for scrambling
     * @default "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+"
     */
    chars?: string;

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
 * TextReveal - Text that reveals itself with a decoding effect
 */
export const TextReveal = memo(function TextReveal({
    text,
    speed = 50,
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+',
    className,
    style,
}: TextRevealProps) {
    const [displayText, setDisplayText] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<any>(null);
    const iterationRef = useRef(0);

    const scramble = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        iterationRef.current = 0;

        intervalRef.current = setInterval(() => {
            setDisplayText((prev) =>
                text
                    .split('')
                    .map((char, index) => {
                        if (index < iterationRef.current) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('')
            );

            if (iterationRef.current >= text.length) {
                clearInterval(intervalRef.current);
            }

            iterationRef.current += 1 / 3; // Slow down the reveal
        }, speed);
    };

    useEffect(() => {
        scramble();
        return () => clearInterval(intervalRef.current);
    }, [text, speed, chars]);

    const handleMouseEnter = () => {
        setIsHovered(true);
        scramble();
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <span
            className={cn('inline-block font-mono cursor-default', className)}
            style={style}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {displayText}
        </span>
    );
});

export default TextReveal;
