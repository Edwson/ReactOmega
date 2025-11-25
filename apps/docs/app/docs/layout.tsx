import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            <Header />
            <div className="flex pt-16">
                {/* Sidebar */}
                <nav className="hidden lg:block w-64 fixed h-[calc(100vh-4rem)] top-16 left-0 border-r border-white/10 overflow-y-auto bg-black/50 backdrop-blur-xl">
                    <div className="p-6 space-y-8">
                        <div className="mb-8">
                            <h1 className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                ReactΩ
                            </h1>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Backgrounds</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <Link href="/docs/backgrounds/hyperdrive" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Hyperdrive
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/starfield" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Starfield
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/cosmic-dust" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Cosmic Dust
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/nebula" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Nebula
                                        </Link>
                                    </li>

                                    <li>
                                        <Link href="/docs/backgrounds/shooting-stars" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Shooting Stars
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/aurora" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Aurora
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/galaxy" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Galaxy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/grid-motion" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Grid Motion
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/particles" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Particles
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/warp-speed" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            WarpSpeed
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/meteor" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Meteor
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/supernova" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Supernova
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/wormhole" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Wormhole
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/constellation" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Constellation
                                        </Link>
                                    </li>

                                    <li>
                                        <Link href="/docs/backgrounds/quantum-field" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            QuantumField
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/nebula-cloud" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            NebulaCloud
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/cyber-grid" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            CyberGrid
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/digital-rain" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            DigitalRain
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/orbital-rings" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            OrbitalRings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/star-travel" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            StarTravel
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/vortex-tunnel" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            VortexTunnel
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/cosmic-rain" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            CosmicRain
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/backgrounds/pulsar" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Pulsar
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Components</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <Link href="/docs/components/glow-card" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            GlowCard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/orbit-menu" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            OrbitMenu
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/star-border" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            StarBorder
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/cosmic-button" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            CosmicButton
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/holographic-card" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            HolographicCard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/stardust-text" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            StardustText
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/magnetic-button" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            MagneticButton
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/text-reveal" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            TextReveal
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/spotlight-card" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            SpotlightCard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/dock" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            Dock
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/glass-card" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            GlassCard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/neon-button" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            NeonButton
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/typewriter-effect" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            TypewriterEffect
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/shiny-button" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            ShinyButton
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/tilted-card" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            TiltedCard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/text-gradient-scroll" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            TextGradientScroll
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/magnetic-icon" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            MagneticIcon
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/docs/components/particles-button" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            ParticlesButton
                                        </Link>
                                    </li>

                                    <li>
                                        <Link href="/docs/components/glitch-text" className="block text-sm text-white/80 hover:text-white transition-colors">
                                            GlitchText
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)]">
                    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
                        {children}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
