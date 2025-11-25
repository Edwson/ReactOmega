'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface ParticlesButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: React.ReactNode;
    /**
     * Color of the particles
     * @default "#8b5cf6"
     */
    color?: string;

    /**
     * Number of particles to emit
     * @default 12
     */
    particleCount?: number;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    angle: number;
    velocity: number;
}

/**
 * ParticlesButton - A button that emits particles on click
 */
export const ParticlesButton = memo(function ParticlesButton({
    children,
    color = '#8b5cf6',
    particleCount = 12,
    className,
    style,
    onClick,
    ...props
}: ParticlesButtonProps) {
    const [particles, setParticles] = useState<Particle[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
            id: Date.now() + i,
            x,
            y,
            angle: (Math.PI * 2 * i) / particleCount,
            velocity: 2 + Math.random() * 2,
        }));

        setParticles((prev) => [...prev, ...newParticles]);
        setTimeout(() => {
            setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
        }, 1000);

        onClick?.(e);
    };

    return (
        <motion.button
            className={cn(
                'relative px-8 py-3 rounded-lg font-bold text-white overflow-hidden bg-gray-900 border border-white/10',
                className
            )}
            style={style}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            {...props as any}
        >
            <span className="relative z-10">{children}</span>

            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{ x: particle.x, y: particle.y, opacity: 1, scale: 1 }}
                        animate={{
                            x: particle.x + Math.cos(particle.angle) * 100 * particle.velocity,
                            y: particle.y + Math.sin(particle.angle) * 100 * particle.velocity,
                            opacity: 0,
                            scale: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute w-2 h-2 rounded-full pointer-events-none z-0"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </AnimatePresence>
        </motion.button>
    );
});

export default ParticlesButton;
