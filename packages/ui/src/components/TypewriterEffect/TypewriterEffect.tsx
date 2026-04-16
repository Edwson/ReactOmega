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

<<<<<<< HEAD
=======
    // Inject keyframe style once, SSR-safe
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const styleId = 'typewriter-blink-style';
        if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `@keyframes tw-blink { 0%,50%{opacity:1} 51%,100%{opacity:0} } .tw-cursor{animation:tw-blink 1s step-end infinite}`;
            document.head.appendChild(styleEl);
        }
    }, []);

>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
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
<<<<<<< HEAD
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
=======
                <span className="tw-cursor inline-block w-[2px] h-[1em] bg-current ml-1" />
            )}
>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
        </span>
    );
});

export default TypewriterEffect;
