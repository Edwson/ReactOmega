'use client';

import { useRef, useState, memo } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface MagneticIconProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: React.ReactNode;
    /**
     * Strength of the magnetic effect
     * @default 0.5
     */
    strength?: number;

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
 * MagneticIcon - An icon that sticks to the cursor magnetically
 */
export const MagneticIcon = memo(function MagneticIcon({
    children,
    strength = 0.5,
    className,
    style,
    ...props
}: MagneticIconProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };

        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);

        setPosition({ x: x * strength, y: y * strength });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            className={cn(
                'relative flex items-center justify-center',
                className
            )}
            style={style}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
            {...props as any}
        >
            {children}
        </motion.div>
    );
});

export default MagneticIcon;
