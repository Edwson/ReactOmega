# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/) · [SemVer](https://semver.org/).

## [1.0.0] — 2026-06-18 — "Re-architecture"

A ground-up rebuild. ReactOmega is now an **AI-native React component registry** focused on
**motion & interaction UI**, deliberately distinct from the cosmic, vanilla-JS
[GalaxyJS](https://github.com/Edwson/GalaxyJS).

### Added
- **Registry architecture** (shadcn-compatible): `registry/meta.json` + component sources →
  `registry.json` + `public/r/*.json` + `llms.txt`, generated deterministically by
  `scripts/build-registry.mjs` (one source of truth — the CLI, shadcn, and MCP can't drift).
- **31 components**, all self-contained, Tailwind-styled, screen-reader aware, and
  **reduced-motion safe by contract**:
  - Text (10) — novel, deeply customizable kinetic typography: `split-text`, `shiny-text`,
    `gradient-text`, `count-up`, `variable-proximity` (per-letter variable-font axes by pointer
    distance), `magnetic-text` (per-letter spring to pointer), `gravity-text` (real gravity fall +
    bounce + reassemble), `elastic-text` (jelly squash/stretch), `scramble-text` (configurable decode),
    `text-reveal` (scroll-linked word-by-word brightening)
  - Interaction (6): `magnetic`, `spotlight-card`, `tilt-card`, `holographic-card` (iridescent foil +
    3D tilt), `click-spark`, `dot-grid`
  - Components (3): `star-border`, `dock`, `marquee`
  - Physics & Art (12) — real verlet/spring/field physics, a distinct lane from GalaxyJS:
    `spring-mesh`, `cloth`, `metaballs`, `rope`, `pendulum-wave`, `newtons-cradle`, `water-ripple`,
    `gravity-wells`, `magnetic-field`, `soft-body`, `plucked-string`, `falling-sand`
  - Primitives: `cn()` util + `usePrefersReducedMotion()` hook (added automatically as deps).
- **Next.js playground** (`web/`) — every component rendered live, deployed to GitHub Pages
  (`https://edwson.github.io/ReactOmega/`) and as a static export for any static host.
- **ReactOmega CLI** (`reactomega`) — `add` / `list`, zero runtime dependencies, resolves a
  component plus its primitives and writes them into your project.
- **MCP server** (`reactomega-mcp`) — `list_components`, `get_component`, `add_component`, over a
  pure `registry-core.mjs` engine; end-to-end tested via the SDK client.
- **`llms.txt`** for AI agents; **`scripts/test-registry.mjs`** (dependency-free CI test that
  verifies sync, dependency resolution, and the reduced-motion contract).

### Changed
- Identity reset from "cosmic React animation library" (which overlapped GalaxyJS) to
  "AI-native motion & interaction registry." Root `package.json` exposes the `reactomega`
  and `reactomega-mcp` bins; CI runs syntax + esbuild + registry-drift + a live MCP test.
