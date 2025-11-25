import Link from 'next/link';
import {
  Hyperdrive,
  GlowCard,
  StarBorder,
  CosmicButton,
  ShinyButton,
  TiltedCard,
  TextGradientScroll,
  MagneticIcon,
  ParticlesButton,
  GlitchText
} from '@reactomega/ui';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <Hyperdrive speed={0.5} starCount={1000} interactive className="absolute inset-0" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6">
          <div className="mb-6 animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium text-white/70 uppercase tracking-widest">
              v1.0.0 Public Beta
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 animate-fade-in-up delay-100">
            ReactΩ
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            A premium cosmic-themed React animation component library.
            <br className="hidden sm:block" />
            Built for the next generation of web interfaces.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
            <Link href="/docs/backgrounds/hyperdrive">
              <ShinyButton className="min-w-[160px]" color="#7928ca">
                Get Started
              </ShinyButton>
            </Link>
            <Link href="/docs/components/glow-card">
              <button className="px-8 py-3 rounded-lg border border-white/20 bg-white/5 text-white font-bold hover:bg-white/10 transition-colors backdrop-blur-sm min-w-[160px]">
                Browse Components
              </button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { title: '50+ Components', desc: 'Ready-to-use cosmic UI elements' },
              { title: 'Zero Config', desc: 'Copy-paste architecture' },
              { title: 'TypeScript', desc: 'Fully typed for best DX' },
              { title: 'Modern Stack', desc: 'React 18+, Tailwind, Framer Motion' },
            ].map((feature, i) => (
              <GlowCard key={i} className="p-6 sm:p-8 h-full" hue={200 + i * 20}>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm sm:text-base">{feature.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <GlitchText
              text="Cosmic Components"
              className="text-3xl sm:text-4xl md:text-5xl mb-4"
              glitchColor="#ff00ff"
              glitchColor2="#00ffff"
            />
            <p className="text-lg sm:text-xl text-white/60">
              Beautifully crafted components for your next project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Tilted Card */}
            <TiltedCard className="h-[350px] sm:h-[400px] flex flex-col items-center justify-center bg-white/5 border-white/10">
              <div className="text-center space-y-4 px-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Tilted Card</h3>
                <p className="text-white/60 text-sm sm:text-base">Interactive 3D hover effect</p>
              </div>
            </TiltedCard>

            {/* Card 2: Magnetic & Particles */}
            <div className="h-[350px] sm:h-[400px] rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-6 sm:gap-8 p-6 sm:p-8">
              <MagneticIcon strength={0.5} className="p-4 rounded-full bg-white/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </MagneticIcon>
              <ParticlesButton color="#00ff88">
                Click Me!
              </ParticlesButton>
              <p className="text-white/60 text-xs sm:text-sm">Magnetic Icon & Particles Button</p>
            </div>

            {/* Card 3: Shiny Button */}
            <div className="h-[350px] sm:h-[400px] rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-6 sm:gap-8 p-6 sm:p-8 md:col-span-2 lg:col-span-1">
              <ShinyButton color="#ff0080">
                Shiny Button
              </ShinyButton>
              <CosmicButton>
                Cosmic Button
              </CosmicButton>
              <p className="text-white/60 text-xs sm:text-sm">Premium Button Styles</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
