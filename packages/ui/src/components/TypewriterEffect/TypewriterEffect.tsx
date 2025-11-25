'use client';

import { useState, useEffect, memo } from 'react';
import { cn } from '../../utils/cn';

export interface TypewriterEffectProps {
    text: string;
    speed?: number;
    showCursor?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onComplete?: () => void;
}

export const TypewriterEffect = memo(function TypewriterEffect({
    text,
    speed = 50,
    showCursor = true,
    className,
    style,
    onComplete,
}: TypewriterEffectProps) {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, text, speed, onComplete]);

    useEffect(() => {
        setDisplayText('');
        setCurrentIndex(0);
    }, [text]);

    return (
        <span className={cn('font-mono', className)} style={style}>
            {displayText}
            {showCursor && (
                <span className="inline-block w-[2px] h-[1em] bg-current ml-1 animate-blink" />
            )}
            <style>{`
        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
        </span>
    );
});

export default TypewriterEffect;
