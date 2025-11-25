'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Github, Linkedin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const menuContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-96 bg-black border-l border-white/10 z-[9999] flex flex-col h-[100dvh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                ReactΩ
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/60 hover:text-white transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Main Links */}
                            <div className="space-y-4">
                                <Link
                                    href="/docs/backgrounds/hyperdrive"
                                    onClick={() => setIsOpen(false)}
                                    className="block text-xl font-medium text-white/90 hover:text-white py-3 transition-colors"
                                >
                                    Documentation
                                </Link>
                                <Link
                                    href="https://github.com/Edwson/ReactOmega"
                                    target="_blank"
                                    className="flex items-center gap-3 text-xl font-medium text-white/90 hover:text-white py-3 transition-colors"
                                >
                                    <Github className="w-6 h-6" /> GitHub
                                </Link>
                                <Link
                                    href="https://www.linkedin.com/in/ed-chen-saas/"
                                    target="_blank"
                                    className="flex items-center gap-3 text-xl font-medium text-white/90 hover:text-white py-3 transition-colors"
                                >
                                    <Linkedin className="w-6 h-6" /> LinkedIn
                                </Link>
                            </div>

                            <div className="h-px bg-white/10" />

                            {/* Backgrounds Section */}
                            <div>
                                <button
                                    onClick={() => toggleSection('backgrounds')}
                                    className="flex items-center justify-between w-full text-xl font-semibold text-white py-3"
                                >
                                    Backgrounds
                                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'backgrounds' ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {expandedSection === 'backgrounds' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-2 pb-4 space-y-1">
                                                <Link href="/docs/backgrounds/hyperdrive" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Hyperdrive</Link>
                                                <Link href="/docs/backgrounds/starfield" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Starfield</Link>
                                                <Link href="/docs/backgrounds/cosmic-dust" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Cosmic Dust</Link>
                                                <Link href="/docs/backgrounds/nebula" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Nebula</Link>
                                                <Link href="/docs/backgrounds/shooting-stars" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Shooting Stars</Link>
                                                <Link href="/docs/backgrounds/aurora" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Aurora</Link>
                                                <Link href="/docs/backgrounds/galaxy" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Galaxy</Link>
                                                <Link href="/docs/backgrounds/grid-motion" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Grid Motion</Link>
                                                <Link href="/docs/backgrounds/particles" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Particles</Link>
                                                <Link href="/docs/backgrounds/warp-speed" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">WarpSpeed</Link>
                                                <Link href="/docs/backgrounds/meteor" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Meteor</Link>
                                                <Link href="/docs/backgrounds/supernova" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Supernova</Link>
                                                <Link href="/docs/backgrounds/wormhole" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Wormhole</Link>
                                                <Link href="/docs/backgrounds/constellation" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Constellation</Link>
                                                <Link href="/docs/backgrounds/quantum-field" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">QuantumField</Link>
                                                <Link href="/docs/backgrounds/nebula-cloud" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">NebulaCloud</Link>
                                                <Link href="/docs/backgrounds/cyber-grid" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">CyberGrid</Link>
                                                <Link href="/docs/backgrounds/digital-rain" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">DigitalRain</Link>
                                                <Link href="/docs/backgrounds/orbital-rings" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">OrbitalRings</Link>
                                                <Link href="/docs/backgrounds/star-travel" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">StarTravel</Link>
                                                <Link href="/docs/backgrounds/vortex-tunnel" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">VortexTunnel</Link>
                                                <Link href="/docs/backgrounds/cosmic-rain" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">CosmicRain</Link>
                                                <Link href="/docs/backgrounds/pulsar" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Pulsar</Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Components Section */}
                            <div>
                                <button
                                    onClick={() => toggleSection('components')}
                                    className="flex items-center justify-between w-full text-xl font-semibold text-white py-3"
                                >
                                    Components
                                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'components' ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {expandedSection === 'components' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-2 pb-4 space-y-1">
                                                <Link href="/docs/components/glow-card" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">GlowCard</Link>
                                                <Link href="/docs/components/orbit-menu" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">OrbitMenu</Link>
                                                <Link href="/docs/components/star-border" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">StarBorder</Link>
                                                <Link href="/docs/components/cosmic-button" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">CosmicButton</Link>
                                                <Link href="/docs/components/holographic-card" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">HolographicCard</Link>
                                                <Link href="/docs/components/stardust-text" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">StardustText</Link>
                                                <Link href="/docs/components/magnetic-button" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">MagneticButton</Link>
                                                <Link href="/docs/components/text-reveal" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">TextReveal</Link>
                                                <Link href="/docs/components/spotlight-card" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">SpotlightCard</Link>
                                                <Link href="/docs/components/dock" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">Dock</Link>
                                                <Link href="/docs/components/glass-card" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">GlassCard</Link>
                                                <Link href="/docs/components/neon-button" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">NeonButton</Link>
                                                <Link href="/docs/components/typewriter-effect" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">TypewriterEffect</Link>
                                                <Link href="/docs/components/shiny-button" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">ShinyButton</Link>
                                                <Link href="/docs/components/tilted-card" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">TiltedCard</Link>
                                                <Link href="/docs/components/text-gradient-scroll" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">TextGradientScroll</Link>
                                                <Link href="/docs/components/magnetic-icon" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">MagneticIcon</Link>
                                                <Link href="/docs/components/particles-button" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">ParticlesButton</Link>
                                                <Link href="/docs/components/glitch-text" onClick={() => setIsOpen(false)} className="block text-lg text-white/70 hover:text-white py-2.5 pl-4 transition-colors">GlitchText</Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <div className="lg:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" />
            </button>
            {mounted && createPortal(menuContent, document.body)}
        </div>
    );
}
