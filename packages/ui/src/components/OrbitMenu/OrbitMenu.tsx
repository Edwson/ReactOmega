'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface OrbitMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

export interface OrbitMenuProps {
    /**
     * Menu items
     */
    items: OrbitMenuItem[];

    /**
     * Radius of the orbit
     * @default 100
     */
    radius?: number;

    /**
     * Color of the menu button
     * @default "#ffffff"
     */
    color?: string;

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
 * OrbitMenu - Circular navigation menu with orbiting items
 */
export const OrbitMenu = memo(function OrbitMenu({
    items,
    radius = 100,
    color = '#ffffff',
    className,
    style,
}: OrbitMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div
            className={cn('relative flex items-center justify-center', className)}
            style={style}
        >
            {/* Main Button */}
            <button
                onClick={toggleMenu}
                className="relative z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
                style={{ color }}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </motion.div>
            </button>

            {/* Orbiting Items */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {items.map((item, index) => {
                            const angle = (index / items.length) * 360;
                            const radian = (angle * Math.PI) / 180;
                            const x = Math.cos(radian) * radius;
                            const y = Math.sin(radian) * radius;

                            return (
                                <motion.button
                                    key={index}
                                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                    animate={{ x, y, opacity: 1, scale: 1 }}
                                    exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 200,
                                        damping: 20,
                                        delay: index * 0.05,
                                    }}
                                    onClick={() => {
                                        item.onClick?.();
                                        setIsOpen(false);
                                    }}
                                    className="absolute z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/30 transition-colors text-xs"
                                    style={{ color }}
                                    title={item.label}
                                >
                                    {item.icon || item.label[0]}
                                </motion.button>
                            );
                        })}
                    </>
                )}
            </AnimatePresence>

            {/* Orbit Ring (Visual) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.2, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute z-0 rounded-full border border-dashed border-white pointer-events-none"
                        style={{
                            width: radius * 2,
                            height: radius * 2,
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
});

export default OrbitMenu;
