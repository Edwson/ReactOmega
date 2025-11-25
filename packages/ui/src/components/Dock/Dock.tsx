'use client';

import { useRef, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface DockProps {
    /**
     * Dock items
     */
    items: {
        icon: React.ReactNode;
        label: string;
        onClick?: () => void;
    }[];

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;
}

function DockItem({
    mouseX,
    children,
    onClick,
}: {
    mouseX: MotionValue;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <motion.div
            ref={ref}
            style={{ width }}
            onClick={onClick}
            className="aspect-square w-10 rounded-full bg-white/10 border border-white/5 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
        >
            <div className="w-full h-full p-2 flex items-center justify-center">
                {children}
            </div>
        </motion.div>
    );
}

/**
 * Dock - macOS-style dock with magnification
 */
export const Dock = memo(function Dock({ items, className, style }: DockProps) {
    const mouseX = useMotionValue(Infinity);

    return (
        <div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={cn(
                'mx-auto flex h-16 items-end gap-4 rounded-2xl bg-black/50 border border-white/10 px-4 pb-3',
                className
            )}
            style={style}
        >
            {items.map((item, index) => (
                <DockItem key={index} mouseX={mouseX} onClick={item.onClick}>
                    {item.icon}
                </DockItem>
            ))}
        </div>
    );
});

export default Dock;
