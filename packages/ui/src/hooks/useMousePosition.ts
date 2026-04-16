'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * useMousePosition (ref version) — stores mouse position in a ref.
 * Does NOT trigger re-renders on every mousemove.
 * Suitable for canvas animations and other read-on-demand use cases.
 */
export const useMousePosition = () => {
    const position = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            position.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handler, { passive: true });
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    return position;
};

/**
 * useMousePositionReactive — triggers a re-render on every mousemove.
 * Use only when the component must reactively re-render from mouse position.
 */
export const useMousePositionReactive = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateMousePosition = (ev: MouseEvent) => {
            setMousePosition({ x: ev.clientX, y: ev.clientY });
        };

        window.addEventListener('mousemove', updateMousePosition, { passive: true });

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    return mousePosition;
};
