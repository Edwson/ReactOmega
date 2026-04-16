'use client';

import { useRef, useState, memo } from 'react';
<<<<<<< HEAD
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
=======
import { motion, MotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

// Omit native event handlers that conflict with framer-motion's MotionProps
// to avoid TypeScript errors when spreading both onto motion.button.
type NativeButtonProps = Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof MotionProps
>;

export interface MagneticButtonProps extends NativeButtonProps {
>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
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
 * MagneticButton - Button that magnetically attracts the cursor
 */
export const MagneticButton = memo(function MagneticButton({
    children,
    strength = 0.5,
    className,
    style,
    ...props
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();

        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);

        setPosition({ x: x * strength, y: y * strength });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
            className={cn(
                'relative inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-colors hover:bg-white/90',
                className
            )}
            style={style}
<<<<<<< HEAD
            {...props as any}
=======
            {...props}
>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
        >
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
});

export default MagneticButton;
