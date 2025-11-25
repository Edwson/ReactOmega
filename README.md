# ReactΩ (React Omega)

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
```

## 🤝 Contributing

Contributions are welcome! If you'd like to add a new component or improve an existing one:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-component`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
