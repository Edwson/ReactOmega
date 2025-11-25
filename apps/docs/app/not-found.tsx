'use client';

import Link from 'next/link';
import { Wormhole } from '@reactomega/ui';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-black text-white font-sans">
            <Wormhole color="#ff0055" secondaryColor="#7928ca" />

            {/* Content */}
            <div className="relative z-10 text-center space-y-8 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/10">
                        404
                    </h1>
                    <h2 className="text-2xl md:text-4xl font-light tracking-wide text-white/80 mt-4">
                        LOST IN SPACE
                    </h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-white/60 max-w-md mx-auto"
                >
                    The coordinates you are looking for do not exist in this sector.
                    You may have drifted into a black hole.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                >
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-colors"
                    >
                        Return to Base
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
