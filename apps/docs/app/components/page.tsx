'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ComponentItem {
  name: string;
  slug: string;
  description: string;
  tags: string[];
  accent: string;
}

const COMPONENTS: ComponentItem[] = [
  {
    name: 'GlowCard',
    slug: 'glow-card',
    description: 'Interactive card with a dynamic radial glow that follows your cursor. Customizable hue and intensity.',
    tags: ['card', 'interactive', 'glow'],
    accent: '#7c3aed',
  },
  {
    name: 'HolographicCard',
    slug: 'holographic-card',
    description: 'A tilt-reactive card that renders a holographic rainbow shimmer effect on hover.',
    tags: ['card', 'holographic', '3d'],
    accent: '#06b6d4',
  },
  {
    name: 'SpotlightCard',
    slug: 'spotlight-card',
    description: 'Card with a spotlight that tracks your mouse, illuminating content from any angle.',
    tags: ['card', 'interactive', 'spotlight'],
    accent: '#f59e0b',
  },
  {
    name: 'GlassCard',
    slug: 'glass-card',
    description: 'Frosted glass aesthetic card with backdrop blur and subtle border.',
    tags: ['card', 'glassmorphism'],
    accent: '#64748b',
  },
  {
    name: 'TiltedCard',
    slug: 'tilted-card',
    description: 'Smooth 3D perspective tilt effect driven by mouse position.',
    tags: ['card', '3d', 'interactive'],
    accent: '#10b981',
  },
  {
    name: 'NeonButton',
    slug: 'neon-button',
    description: 'Glowing neon button with customizable color, pulse animation, and text shadow.',
    tags: ['button', 'neon', 'animated'],
    accent: '#00ffff',
  },
  {
    name: 'CosmicButton',
    slug: 'cosmic-button',
    description: 'Space-themed button with animated starfield particle burst on click.',
    tags: ['button', 'cosmic', 'particles'],
    accent: '#9945ff',
  },
  {
    name: 'ShinyButton',
    slug: 'shiny-button',
    description: 'Premium button with a sweeping light shimmer animation pass.',
    tags: ['button', 'shiny', 'premium'],
    accent: '#ec4899',
  },
  {
    name: 'ParticlesButton',
    slug: 'particles-button',
    description: 'Button that emits a burst of colorful particles on click interaction.',
    tags: ['button', 'particles', 'interactive'],
    accent: '#00ff88',
  },
  {
    name: 'MagneticButton',
    slug: 'magnetic-button',
    description: 'Button with magnetic attraction — it follows your cursor as you approach.',
    tags: ['button', 'magnetic', 'physics'],
    accent: '#f97316',
  },
  {
    name: 'StarBorder',
    slug: 'star-border',
    description: 'Animated rotating star-shaped border that wraps any element.',
    tags: ['border', 'animated', 'decorative'],
    accent: '#fbbf24',
  },
  {
    name: 'GlitchText',
    slug: 'glitch-text',
    description: 'RGB-split glitch animation for headings with configurable glitch colors.',
    tags: ['text', 'glitch', 'animated'],
    accent: '#ff00ff',
  },
  {
    name: 'StardustText',
    slug: 'stardust-text',
    description: 'Text that dissolves into and reforms from a burst of stardust particles.',
    tags: ['text', 'particles', 'animated'],
    accent: '#fde68a',
  },
  {
    name: 'TextReveal',
    slug: 'text-reveal',
    description: 'Cinematic text reveal animation driven by scroll position.',
    tags: ['text', 'scroll', 'reveal'],
    accent: '#a78bfa',
  },
  {
    name: 'TextGradientScroll',
    slug: 'text-gradient-scroll',
    description: 'Text that fills with a gradient as the user scrolls through the page.',
    tags: ['text', 'scroll', 'gradient'],
    accent: '#34d399',
  },
  {
    name: 'TypewriterEffect',
    slug: 'typewriter-effect',
    description: 'Classic typewriter with multi-string cycling, configurable speed, and blinking cursor.',
    tags: ['text', 'typewriter', 'animated'],
    accent: '#38bdf8',
  },
  {
    name: 'MagneticIcon',
    slug: 'magnetic-icon',
    description: 'Icon wrapper that repels or attracts toward the cursor with configurable strength.',
    tags: ['icon', 'magnetic', 'interactive'],
    accent: '#fb923c',
  },
  {
    name: 'OrbitMenu',
    slug: 'orbit-menu',
    description: 'Radial navigation menu where items orbit a central element on activation.',
    tags: ['menu', 'orbit', 'navigation'],
    accent: '#818cf8',
  },
  {
    name: 'Dock',
    slug: 'dock',
    description: 'macOS-style magnification dock with smooth spring physics on hover.',
    tags: ['navigation', 'dock', 'physics'],
    accent: '#e879f9',
  },
];

const ALL_TAGS = Array.from(new Set(COMPONENTS.flatMap((c) => c.tags))).sort();

export default function ComponentsPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = COMPONENTS.filter((c) => {
    const matchesTag = activeTag ? c.tags.includes(activeTag) : true;
    const matchesSearch =
      search.trim() === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* Page Header */}
      <div className="border-b border-white/8 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Ω</span>
            </div>
            <span className="font-semibold text-white/70 group-hover:text-white transition-colors text-sm">ReactΩ</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/components" className="text-white font-medium">Components</Link>
            <Link href="/backgrounds" className="hover:text-white transition-colors">Backgrounds</Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            UI Components
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
              Components
            </span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl">
            {COMPONENTS.length} premium interactive components. Drop them into any React project and customize with props.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeTag === null
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
              }`}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeTag === tag
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-white/30 mb-6">
          Showing {filtered.length} of {COMPONENTS.length} components
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((component) => (
            <Link
              key={component.slug}
              href={`/docs/components/${component.slug}`}
              className="group relative rounded-xl border border-white/8 bg-white/3 p-6 hover:border-white/15 hover:bg-white/6 transition-all duration-200 overflow-hidden"
            >
              {/* Accent glow */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none blur-2xl"
                style={{ background: component.accent, transform: 'translate(30%, -30%)' }}
              />

              {/* Color dot + name */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: component.accent, boxShadow: `0 0 6px ${component.accent}80` }}
                  />
                  <h3 className="font-semibold text-white group-hover:text-white transition-colors">
                    {component.name}
                  </h3>
                </div>
                <svg
                  className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0 mt-0.5"
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </div>

              {/* Description */}
              <p className="text-sm text-white/50 group-hover:text-white/65 transition-colors leading-relaxed mb-4">
                {component.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {component.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs border border-white/8 bg-white/4 text-white/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-lg">No components match your search.</p>
            <button
              onClick={() => { setSearch(''); setActiveTag(null); }}
              className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Quick install */}
        <div className="mt-16 rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-2">Quick Install</h2>
          <p className="text-sm text-white/50 mb-4">Add ReactΩ to your project in seconds.</p>
          <div className="flex items-center gap-3 bg-black/60 rounded-lg px-4 py-3 border border-white/8 font-mono text-sm">
            <span className="text-white/30 select-none">$</span>
            <span className="text-green-400">npm install @reactomega/ui</span>
          </div>
        </div>
      </div>
    </main>
  );
}
