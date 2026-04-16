'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BackgroundItem {
  name: string;
  slug: string;
  description: string;
  tags: string[];
  accent: string;
  snippet: string;
}

const BACKGROUNDS: BackgroundItem[] = [
  {
    name: 'Hyperdrive',
    slug: 'hyperdrive',
    description: 'Immersive warp-speed star tunnel. Interactive mode lets users steer through hyperspace.',
    tags: ['canvas', 'interactive', '3d'],
    accent: '#7c3aed',
    snippet: '<Hyperdrive speed={0.5} starCount={1000} interactive />',
  },
  {
    name: 'Starfield',
    slug: 'starfield',
    description: 'Classic parallax star field with configurable density, speed, and color.',
    tags: ['canvas', 'parallax'],
    accent: '#1d4ed8',
    snippet: '<Starfield starCount={200} speed={0.5} color="#ffffff" />',
  },
  {
    name: 'Aurora',
    slug: 'aurora',
    description: 'GPU-rendered northern lights using WebGL shader. Smooth undulating color bands.',
    tags: ['webgl', 'shader', 'animated'],
    accent: '#059669',
    snippet: '<Aurora color="#00ff88" speed={1} />',
  },
  {
    name: 'Galaxy',
    slug: 'galaxy',
    description: 'Rotating spiral galaxy with thousands of particle stars and nebula dust.',
    tags: ['canvas', 'particles', '3d'],
    accent: '#9333ea',
    snippet: '<Galaxy particleCount={5000} rotationSpeed={0.001} />',
  },
  {
    name: 'NebulaCloud',
    slug: 'nebula-cloud',
    description: 'Volumetric nebula cloud effect with layered color gradients and soft glow.',
    tags: ['canvas', 'animated'],
    accent: '#7e22ce',
    snippet: '<NebulaCloud color="#9945ff" opacity={0.8} />',
  },
  {
    name: 'Nebula',
    slug: 'nebula',
    description: 'Procedurally generated nebula with dynamic color mixing and depth layers.',
    tags: ['canvas', 'procedural'],
    accent: '#db2777',
    snippet: '<Nebula colors={["#ff0080", "#7928ca"]} />',
  },
  {
    name: 'Particles',
    slug: 'particles',
    description: 'Floating connected-dot particle system with mouse interaction and linking lines.',
    tags: ['canvas', 'interactive', 'particles'],
    accent: '#0891b2',
    snippet: '<Particles count={80} interactive linkDistance={120} />',
  },
  {
    name: 'WarpSpeed',
    slug: 'warp-speed',
    description: 'Streaking light trails radiating from center — classic sci-fi warp effect.',
    tags: ['canvas', 'animated'],
    accent: '#2563eb',
    snippet: '<WarpSpeed speed={2} trailLength={0.92} starCount={300} />',
  },
  {
    name: 'StarTravel',
    slug: 'star-travel',
    description: 'First-person star travel flythrough with depth-of-field motion blur.',
    tags: ['canvas', '3d', 'animated'],
    accent: '#0284c7',
    snippet: '<StarTravel speed={1.5} fov={60} />',
  },
  {
    name: 'ShootingStars',
    slug: 'shooting-stars',
    description: 'Random shooting star streaks across a dark sky background.',
    tags: ['canvas', 'animated'],
    accent: '#f59e0b',
    snippet: '<ShootingStars frequency={0.05} trailColor="#fff" />',
  },
  {
    name: 'Meteor',
    slug: 'meteor',
    description: 'Diagonal meteor showers with glowing trails and variable speed.',
    tags: ['canvas', 'animated'],
    accent: '#ea580c',
    snippet: '<Meteor count={20} angle={215} speed={5} />',
  },
  {
    name: 'Supernova',
    slug: 'supernova',
    description: 'Explosive supernova burst animation with expanding shockwave and debris.',
    tags: ['canvas', 'animated', 'dramatic'],
    accent: '#dc2626',
    snippet: '<Supernova color="#ff6600" size={400} />',
  },
  {
    name: 'Constellation',
    slug: 'constellation',
    description: 'Interactive star constellation map — hover to reveal connecting lines.',
    tags: ['canvas', 'interactive'],
    accent: '#6366f1',
    snippet: '<Constellation starCount={50} interactive connectRadius={100} />',
  },
  {
    name: 'OrbitalRings',
    slug: 'orbital-rings',
    description: 'Concentric orbital rings with particles following elliptical paths.',
    tags: ['canvas', 'animated', '3d'],
    accent: '#0e7490',
    snippet: '<OrbitalRings rings={4} particlesPerRing={12} />',
  },
  {
    name: 'VortexTunnel',
    slug: 'vortex-tunnel',
    description: 'Mesmerizing rotating vortex tunnel effect with configurable speed and color.',
    tags: ['canvas', 'animated', 'hypnotic'],
    accent: '#7c3aed',
    snippet: '<VortexTunnel speed={0.8} color="#9945ff" />',
  },
  {
    name: 'Wormhole',
    slug: 'wormhole',
    description: 'Twisting space-time wormhole with depth distortion and light bending.',
    tags: ['webgl', 'shader', 'dramatic'],
    accent: '#1e40af',
    snippet: '<Wormhole speed={1} warpIntensity={0.5} />',
  },
  {
    name: 'QuantumField',
    slug: 'quantum-field',
    description: 'Quantum interference wave pattern that ripples and interferes realistically.',
    tags: ['canvas', 'physics', 'animated'],
    accent: '#0d9488',
    snippet: '<QuantumField frequency={0.02} amplitude={30} />',
  },
  {
    name: 'CosmicDust',
    slug: 'cosmic-dust',
    description: 'Gently drifting dust motes and micro-particles in a dark void.',
    tags: ['canvas', 'ambient'],
    accent: '#78350f',
    snippet: '<CosmicDust count={150} driftSpeed={0.3} />',
  },
  {
    name: 'CosmicRain',
    slug: 'cosmic-rain',
    description: 'Vertical rain of glowing cosmic particles with variable density.',
    tags: ['canvas', 'animated'],
    accent: '#1d4ed8',
    snippet: '<CosmicRain count={100} speed={3} color="#00aaff" />',
  },
  {
    name: 'CyberGrid',
    slug: 'cyber-grid',
    description: 'Perspective-receding neon grid with pulse wave propagation.',
    tags: ['canvas', 'cyberpunk', 'animated'],
    accent: '#16a34a',
    snippet: '<CyberGrid color="#00ff41" speed={0.5} perspective={800} />',
  },
  {
    name: 'DigitalRain',
    slug: 'digital-rain',
    description: 'Matrix-style cascading character rain. Configurable charset, speed, and color.',
    tags: ['canvas', 'matrix', 'animated'],
    accent: '#15803d',
    snippet: '<DigitalRain color="#00ff41" speed={1.5} charset="01" />',
  },
  {
    name: 'GridMotion',
    slug: 'grid-motion',
    description: 'Animated grid of tiles with wave motion and depth illusion.',
    tags: ['canvas', 'grid', 'animated'],
    accent: '#0891b2',
    snippet: '<GridMotion cols={20} rows={10} speed={1} />',
  },
  {
    name: 'Pulsar',
    slug: 'pulsar',
    description: 'Pulsating electromagnetic emission rings emanating from a central star.',
    tags: ['canvas', 'animated', 'radial'],
    accent: '#be185d',
    snippet: '<Pulsar color="#ff0080" pulseInterval={1500} rings={5} />',
  },
];

const ALL_TAGS = Array.from(new Set(BACKGROUNDS.flatMap((b) => b.tags))).sort();

export default function BackgroundsPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const filtered = BACKGROUNDS.filter((b) => {
    const matchesTag = activeTag ? b.tags.includes(activeTag) : true;
    const matchesSearch =
      search.trim() === '' ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const copySnippet = (slug: string, snippet: string) => {
    navigator.clipboard.writeText(snippet).catch(() => {});
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

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
            <Link href="/components" className="hover:text-white transition-colors">Components</Link>
            <Link href="/backgrounds" className="text-white font-medium">Backgrounds</Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Background Components
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
              Backgrounds
            </span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl">
            {BACKGROUNDS.length} atmospheric background components. Canvas, WebGL, and shader-powered — zero configuration.
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
              placeholder="Search backgrounds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeTag === null
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
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
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
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
          Showing {filtered.length} of {BACKGROUNDS.length} backgrounds
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bg) => (
            <div
              key={bg.slug}
              className="group relative rounded-xl border border-white/8 bg-white/3 overflow-hidden hover:border-white/15 transition-all duration-200"
            >
              {/* Accent glow top bar */}
              <div
                className="h-0.5 w-full opacity-60"
                style={{ background: `linear-gradient(90deg, transparent, ${bg.accent}, transparent)` }}
              />

              {/* Preview area */}
              <div className="relative h-28 overflow-hidden">
                {/* Starfield-like placeholder */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(ellipse at 50% 80%, ${bg.accent}40 0%, transparent 70%), #000`,
                  }}
                />
                {/* Stars dots decoration */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: Math.random() * 2 + 1 + 'px',
                      height: Math.random() * 2 + 1 + 'px',
                      left: (i * 37 + 11) % 100 + '%',
                      top: (i * 53 + 7) % 100 + '%',
                      opacity: Math.random() * 0.6 + 0.2,
                    }}
                  />
                ))}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ color: bg.accent }}
                >
                  <span className="text-3xl font-bold opacity-30 tracking-wider">{bg.name[0]}</span>
                </div>
                <Link
                  href={`/docs/backgrounds/${bg.slug}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm"
                >
                  <span className="text-sm font-medium text-white px-4 py-2 rounded-lg border border-white/20 bg-white/10">
                    View Docs
                  </span>
                </Link>
              </div>

              <div className="p-5">
                {/* Name + link */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ background: bg.accent, boxShadow: `0 0 6px ${bg.accent}60` }}
                    />
                    <h3 className="font-semibold text-white">{bg.name}</h3>
                  </div>
                  <Link
                    href={`/docs/backgrounds/${bg.slug}`}
                    className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </Link>
                </div>

                {/* Description */}
                <p className="text-sm text-white/50 leading-relaxed mb-4">{bg.description}</p>

                {/* Code snippet */}
                <div className="relative group/code rounded-lg bg-black/50 border border-white/8 px-3 py-2.5 font-mono text-xs text-white/60 overflow-hidden">
                  <code className="block truncate">{bg.snippet}</code>
                  <button
                    onClick={() => copySnippet(bg.slug, bg.snippet)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/code:opacity-100 transition-opacity p-1 rounded bg-white/10 hover:bg-white/20 text-white/70"
                    aria-label="Copy snippet"
                  >
                    {copiedSlug === bg.slug ? (
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {bg.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-xs border border-white/8 bg-white/4 text-white/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-lg">No backgrounds match your search.</p>
            <button
              onClick={() => { setSearch(''); setActiveTag(null); }}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Stats footer */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Backgrounds', value: String(BACKGROUNDS.length) },
            { label: 'Canvas-based', value: String(BACKGROUNDS.filter(b => b.tags.includes('canvas')).length) },
            { label: 'WebGL / Shader', value: String(BACKGROUNDS.filter(b => b.tags.includes('webgl') || b.tags.includes('shader')).length) },
            { label: 'Interactive', value: String(BACKGROUNDS.filter(b => b.tags.includes('interactive')).length) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/8 bg-white/3 p-5 text-center">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
