# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/) · [SemVer](https://semver.org/).

## [1.1.0] — 2026-07-28 — "Surfaces"

Twenty new components (31 → **51**) and a second primitive. The theme is surfaces you can
touch: light on a material, the pointer itself, and the page as it scrolls.

### Added
- **`useShader()` primitive** — a raw **WebGL2** runtime for full-screen fragment shaders in
  ~290 lines and **still zero runtime dependencies** (no `ogl`, no `three`). Draws a single
  full-screen triangle from `gl_VertexID` (no buffers to allocate or leak) and owns the whole
  lifecycle: DPR-clamped sizing via `ResizeObserver`, an `IntersectionObserver` that suspends the
  loop off-screen, pause on tab blur, context-loss recovery, eased pointer input, uniform
  declarations generated from the values you pass, and a single still frame for reduced-motion
  users. Reports `supported: false` when WebGL2 is missing so components fall back to CSS
  instead of a blank box.
- **Shaders & Light (6)** — `liquid-metal` (domain-warped FBM height field, normals from finite
  differences, swept polish bands), `thin-film` (two-beam interference evaluated at three
  wavelengths — real fringe order, not a hue rotation), `caustics` (folded coordinates
  accumulating reciprocal distance), `halftone-gradient` (angled per-channel dot screens with
  √-corrected dot area, or a computed 4×4 Bayer matrix), `volumetric-rays` (radial scattering
  integral with decay normalised by sample count), `curl-flow` (FBM as a stream function; the
  velocity is the perpendicular of its gradient, so the field is divergence-free by construction).
- **Cursor & Pointer (5)** — `inertia-cursor`, `elastic-cursor` (stretches along its velocity
  vector with conserved area), `image-trail` (distance-thresholded emission, so spacing is even
  at any speed), `pixel-trail` (sub-cell path walking, so a fast flick still lights a continuous
  line), `crosshair` (point-to-rectangle snapping with a live coordinate readout).
- **Scroll-Driven (4)** — `scroll-stack`, `scroll-velocity`, `parallax-layers`, `scroll-scene`
  (pins a section and exposes scrub progress via render prop, a CSS custom property, and a
  per-frame callback).
- **Components (5)** — `card-swap`, `gooey-nav`, `bento-grid` (one pointer listener for the whole
  grid, published to tiles as inherited custom properties), `elastic-slider` (exponentially damped
  overshoot, full `role="slider"` keyboard contract), `circular-gallery` (drag converted through
  arc length, so tracking is 1:1 at any radius).

### Changed
- `BentoGrid` gains a `rowHeight` prop; the row height was previously hardcoded at 140px, which
  made the component unusable in any frame shorter than two rows.
- The reduced-motion test is now **transitive**: a component satisfies the contract either
  directly or through a primitive that does, so the shaders inherit the guarantee from
  `useShader` rather than restating it.
- The playground gives scroll-driven components a full-height section of their own — a 200px
  preview tile can't demonstrate something driven by the page scroller.

### Fixed
- The CLI's `list` command iterated a hardcoded array of four categories, so components in any
  newer category were silently omitted from its output. Both the CLI and the MCP server now derive
  the category set from the registry.
- The MCP integration test asserted a literal component count, which fails on every addition and
  trains you to bump the number instead of reading the failure. Expected counts now come from
  `registry/meta.json`.

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
