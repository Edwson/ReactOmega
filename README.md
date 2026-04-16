# ReactΩ (React Omega)

<<<<<<< HEAD
**A Next-Gen React Animation Library for Modern Web Development.**

ReactΩ is a collection of premium, high-performance, and visually stunning React components and backgrounds designed to elevate your web applications. Built with **React**, **TypeScript**, and **Tailwind CSS**, it focuses on "wow" factors, smooth animations, and ease of use.

## 🚀 Features

- **Modern & Premium Design**: Glassmorphism, neon glows, cosmic themes, and fluid motions.
- **Fully Typed**: Written in TypeScript for excellent developer experience.
- **Tailwind CSS**: Styled with Tailwind for easy customization.
- **Performance Optimized**: Uses efficient animation techniques (CSS keyframes, Canvas, Framer Motion).
- **Monorepo Structure**: Organized using Turborepo for scalable development.

## 📦 Components

ReactΩ includes a wide range of UI components and immersive backgrounds.

### 🌌 Backgrounds
Immersive, full-screen backgrounds to bring your pages to life.

- **Space & Cosmos**: `Galaxy`, `Nebula`, `Starfield`, `Wormhole`, `Supernova`, `BlackHole`, `CosmicDust`, `AsteroidField`
- **Tech & Cyber**: `CyberGrid`, `DigitalRain`, `GridMotion`, `VortexTunnel`, `Hyperdrive`, `WarpSpeed`
- **Atmospheric**: `Aurora`, `Fog`, `Particles`, `OrbitalRings`, `ShootingStars`

### 🧩 UI Components
Interactive elements to enhance user engagement.

- **Buttons**: `CosmicButton`, `MagneticButton`, `NeonButton`, `ShinyButton`, `ParticlesButton`, `WaveButton`
- **Cards**: `GlassCard`, `GlowCard`, `HolographicCard`, `SpotlightCard`, `TiltedCard`, `StarBorder`
- **Text Effects**: `GlitchText`, `StardustText`, `TextReveal`, `TypewriterEffect`, `TextGradientScroll`
- **Layouts**: `BentoGrid`, `Dock`, `CardStack`, `InfiniteScroll`
- **Icons**: `MagneticIcon`

## 🛠 Installation

To use these components in your project, you can copy the source code directly or install the package (if published).

### Prerequisites

- Node.js 18+
- React 18+
- Tailwind CSS

### Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Edwson/ReactOmega.git
    cd ReactOmega
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Run the documentation site:**

    ```bash
    npm run dev
    ```

    This will start the Next.js documentation app at `http://localhost:3000`.

## 📂 Project Structure

This project is a monorepo managed by [Turborepo](https://turbo.build/repo).

```
ReactΩ/
├── apps/
│   └── docs/          # Documentation site (Next.js)
├── packages/
│   └── ui/            # UI Component Library
│       ├── src/
│       │   ├── backgrounds/  # Background components
│       │   ├── components/   # UI components
│       │   └── index.ts      # Exports
│       ├── package.json
│       └── tsconfig.json
├── package.json       # Root configuration
├── turbo.json         # Turbo pipeline config
└── README.md
=======
> A Next-Gen React Animation Library for Modern Web Development.

[![npm version](https://badge.fury.io/js/%40reactomega%2Fui.svg)](https://www.npmjs.com/package/@reactomega/ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

ReactΩ is a collection of **25+ premium, high-performance React components and backgrounds** designed to bring your web applications to life. Built with React 18, TypeScript 5, Tailwind CSS, Framer Motion, and Three.js.

## ✨ Features

- 🌌 **22 Immersive Backgrounds** — From cosmic nebulae to cyber grids and black holes
- 🧩 **19 Interactive Components** — Magnetic buttons, holographic cards, bento grids, and more
- 🎯 **Fully Typed** — Written in TypeScript with complete JSDoc documentation
- 🚀 **Performance First** — `prefers-reduced-motion` support, `memo()`, optimized canvas renders
- 📦 **Tree-Shakeable** — ESM + CJS output via tsup, only import what you use
- 🎨 **Tailwind CSS** — Easy to customize, works with your existing design system

## 📦 Installation

```bash
npm install @reactomega/ui
```

### Peer Dependencies

```bash
npm install react react-dom framer-motion three @react-three/fiber @react-three/drei
```

## 🚀 Quick Start

```tsx
import { GlowCard, MagneticButton, DigitalRain } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative min-h-screen">
      <DigitalRain color="#00ff88" speed={1} />
      <GlowCard glowColor="#a78bfa" className="p-8 max-w-md mx-auto mt-20">
        <h1 className="text-2xl font-bold text-white mb-4">Hello ReactΩ</h1>
        <MagneticButton>Get Started →</MagneticButton>
      </GlowCard>
    </div>
  );
}
```

## 🌌 Backgrounds (22)

Immersive, full-screen background components:

| Component | Engine | Description |
|-----------|--------|-------------|
| `Aurora` | Three.js GLSL | Northern lights shader effect |
| `BlackHole` | Canvas | Accretion disk with gravitational lensing |
| `AsteroidField` | Canvas | Parallax depth-sorted asteroid belt |
| `CyberGrid` | Canvas | Animated cyber-punk grid lines |
| `DigitalRain` | Canvas | Matrix-style falling characters |
| `Fog` | Canvas | Multi-layer flowing atmospheric fog |
| `Galaxy` | Three.js | Rotating galaxy particle system |
| `GridMotion` | Canvas | Morphing grid motion effect |
| `Hyperdrive` | Canvas | Warp speed light streaks |
| `Meteor` | Canvas | Meteor shower animation |
| `Nebula` | Three.js | Deep-space nebula particle cloud |
| `NebulaCloud` | Canvas | Soft nebula cloud formations |
| `OrbitalRings` | Canvas | Planetary orbital ring system |
| `Particles` | Canvas | Configurable particle field |
| `Pulsar` | Canvas | Pulsing neutron star effect |
| `QuantumField` | Canvas | Quantum field wave interference |
| `ShootingStars` | Canvas | Randomized shooting star trails |
| `Starfield` | Canvas | Deep-space star parallax |
| `StarTravel` | Canvas | Star-travel hyperspace effect |
| `Supernova` | Three.js | Explosive supernova burst |
| `VortexTunnel` | Canvas | Spinning vortex tunnel |
| `WarpSpeed` | Canvas | Warp-speed star streaking |
| `Wormhole` | Three.js | Spacetime wormhole portal |
| `CosmicDust` | Canvas | Drifting cosmic dust field |
| `CosmicRain` | Canvas | Vertical cosmic particle rain |
| `Constellation` | Canvas | Star constellation patterns |

## 🧩 UI Components (19)

### Buttons
| Component | Description |
|-----------|-------------|
| `CosmicButton` | Space-themed button with particle effects |
| `MagneticButton` | Cursor-following magnetic attraction |
| `NeonButton` | Neon glow border button |
| `ParticlesButton` | Particle burst on click |
| `ShinyButton` | Light-sweep shine animation |
| `WaveButton` | Click ripple wave effect |

### Cards
| Component | Description |
|-----------|-------------|
| `GlassCard` | Glassmorphism card with blur backdrop |
| `GlowCard` | Mouse-tracking radial glow |
| `HolographicCard` | 3D tilt + holographic sheen |
| `SpotlightCard` | Cursor spotlight effect |
| `TiltedCard` | CSS perspective tilt on hover |
| `StarBorder` | Animated star-trail border |

### Text Effects
| Component | Description |
|-----------|-------------|
| `GlitchText` | Cyberpunk glitch animation |
| `StardustText` | Star particle text reveal |
| `TextReveal` | Scroll-triggered word reveal |
| `TextGradientScroll` | Gradient reveal on scroll |
| `TypewriterEffect` | Animated typewriter cursor |

### Layouts & Navigation
| Component | Description |
|-----------|-------------|
| `BentoGrid` + `BentoItem` | Irregular bento-box grid layout |
| `CardStack` | Hover-to-fan stacked cards |
| `InfiniteScroll` | CSS marquee in any direction |
| `Dock` | macOS-style magnifying dock |
| `OrbitMenu` | Orbital icon menu |
| `MagneticIcon` | Magnetic hover icon wrapper |

## 🛠 Development

This project is a monorepo managed by [Turborepo](https://turbo.build/repo).

```bash
# Clone the repository
git clone https://github.com/Edwson/ReactOmega.git
cd ReactOmega

# Install dependencies
npm install

# Run the documentation site
npm run dev

# Build the library
npm run build

# Type check
npm run type-check
```

## 📂 Project Structure

```
ReactΩ/
├── apps/
│   └── docs/                 # Documentation site (Next.js 14)
├── packages/
│   └── ui/                   # UI Component Library (@reactomega/ui)
│       ├── src/
│       │   ├── backgrounds/  # 22 background components
│       │   ├── components/   # 19 UI components
│       │   ├── hooks/        # useMousePosition, useAnimationFrame
│       │   └── utils/        # cn(), math, random utilities
│       ├── tsup.config.ts    # Build configuration
│       └── package.json
├── turbo.json                # Turbo pipeline configuration
└── package.json              # Root workspace configuration
>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
```

## 🤝 Contributing

<<<<<<< HEAD
Contributions are welcome! If you'd like to add a new component or improve an existing one:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-component`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
=======
Contributions are welcome!

1. Fork the repository
2. Create a new branch (`git checkout -b feat/amazing-component`)
3. Commit your changes (`git commit -m 'feat: add AmazingComponent'`)
4. Push to the branch (`git push origin feat/amazing-component`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Ed Chen](https://github.com/Edwson)
>>>>>>> 5fdd960 (feat: v0.1.0 — 7 new components, build toolchain, quality improvements, docs site)
