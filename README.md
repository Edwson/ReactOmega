# ReactΩ — ReactOmega

**The AI-native React component registry.** Premium, accessible, reduced-motion-safe
**motion & interaction** components you copy into your project — installable in one line by
**humans _and_ AI agents**.

![Version](https://img.shields.io/badge/version-1.2.0-7c5cff)
![License](https://img.shields.io/badge/license-MIT-blue)
![Deps](https://img.shields.io/badge/runtime%20deps-none-3c873a)
![A11y](https://img.shields.io/badge/reduced--motion-safe-22d3ee)

> Not a black-box `npm install`. Like shadcn/ui and react-bits, you **own the code** — each
> component is a single self-contained file dropped into your repo. What makes ReactOmega
> different: a machine-readable registry + an **MCP server**, so an AI agent can discover and
> install components with structured contracts, not just a human reading docs.

---

## Why ReactOmega

ReactOmega is deliberately **distinct from [GalaxyJS](https://github.com/Edwson/GalaxyJS)** (a
zero-dependency vanilla-JS _cosmic canvas_ library). ReactOmega is **React-first** and focused on
**motion & interaction UI** — text animations, pointer-driven motion, premium components — with a
clean, modern-product aesthetic. No overlap, two clear lanes.

---

## Install a component

**① ReactOmega CLI** — runs straight from GitHub, no npm publish required (you own the files afterwards):

```bash
npx -y github:Edwson/ReactOmega add split-text magnetic
```

**② shadcn** (works as soon as the repo is on GitHub — jsDelivr serves the registry):

```bash
npx shadcn@latest add https://cdn.jsdelivr.net/gh/Edwson/ReactOmega@main/public/r/tilt-card.json
```

**③ AI agent (MCP)** — add to Claude Desktop / Cursor and ask _"add a ReactOmega magnetic button"_:

```json
{ "mcpServers": { "reactomega": { "command": "npx", "args": ["-y", "github:Edwson/ReactOmega", "reactomega-mcp"] } } }
```

Every component is copied into `components/reactomega/*`, pulling its primitives
(`lib/utils.ts`, `hooks/use-prefers-reduced-motion.ts`) automatically. They use **Tailwind** + a
tiny `cn()` helper, honor **`prefers-reduced-motion`**, and are screen-reader aware.

```bash
npx -y github:Edwson/ReactOmega list                  # browse everything
npx -y github:Edwson/ReactOmega list --category text  # filter by category
```

> After an optional `npm publish`, these shorten to `npx reactomega add …` / `npx reactomega list`.

---

## Run the playground

**Live:** **https://edwson.github.io/ReactOmega/** — every one of the 57 components rendered live,
with a copy-paste install command on each card. The playground source lives in [`web/`](web)
(Next.js + Tailwind). To run it locally:

```bash
cd web
npm install
npm run dev        # → http://localhost:3000
```

## Components (v1.2) — 57

**Text Animations** (10) — novel + deeply customizable kinetic typography
`split-text` · `shiny-text` · `gradient-text` · `count-up` · `variable-proximity` (per-letter
variable-font axes by pointer distance) · `magnetic-text` (each letter springs to the pointer) ·
`gravity-text` (letters fall, bounce & reassemble with real gravity) · `elastic-text` (per-letter
jelly squash/stretch) · `scramble-text` (configurable decode) · `text-reveal` (scroll-linked
word-by-word brightening)

**Interaction & Motion** (6)
`magnetic` · `spotlight-card` · `tilt-card` · `holographic-card` (iridescent foil + 3D tilt) ·
`click-spark` · `dot-grid`

**Cursor & Pointer** (5) — *new in 1.1*
`inertia-cursor` (exact dot + spring-lagged ring, difference-blended) · `elastic-cursor` (stretches
along its velocity vector, area conserved) · `image-trail` (distance-thresholded, so spacing is even
at any speed) · `pixel-trail` (sub-cell path walking — a fast flick still lights a continuous line) ·
`crosshair` (point-to-rectangle snapping + live coordinate readout)

**Scroll-Driven** (4) — *new in 1.1*
`scroll-stack` (sticky deck, continuous depth) · `scroll-velocity` (skews with scroll velocity,
frame-rate independent) · `parallax-layers` (progress normalised to the section's own centre) ·
`scroll-scene` (pins a section, exposes 0→1 scrub progress via render prop, CSS variable, or callback)

**Shaders & Light** (12) — **hand-written GLSL on raw WebGL2, still zero deps**
`liquid-metal` (domain-warped FBM, normals from finite differences, swept polish bands) ·
`thin-film` (two-beam interference at three wavelengths — real fringe order, not a hue rotation) ·
`caustics` (folded coordinates accumulating reciprocal distance) · `halftone-gradient` (angled
per-channel dot screens with √-corrected dot area, or a computed 4×4 Bayer matrix) ·
`volumetric-rays` (radial scattering integral, decay normalised by sample count) · `curl-flow`
(FBM as a stream function; velocity is the perpendicular of its gradient, so the field is
divergence-free by construction)

*New in 1.2 — a materials set, each a different optical family:* `refracted-glass` (per-channel
IOR through a bevelled slab — real chromatic dispersion, Schlick Fresnel rim) · `brushed-metal`
(anisotropic GGX with Smith shadowing; the highlight stretches perpendicular to the grain, linear
or engine-turned) · `moire-weave` (two lattices beating at their true difference frequency,
band-limited by an exact box filter so it dissolves rather than aliases) · `velvet-sheen`
(Ashikhmin velvet lobe under an inverted Fresnel — brightest at grazing angles) ·
`translucent-wax` (marched interior light path, Beer–Lambert through a back-lit slab of banded
stone) · `diffraction-grating` (the grating equation solved per order, so spectral lines are sharp
and higher orders wash toward white)

**Physics & Art** (12) — real physics — tactile, designed, never cosmic
`spring-mesh` (press an elastic lattice, waves ripple & settle) · `cloth` (a verlet fabric you grab
& wave) · `metaballs` (gooey fluid that merges around the pointer) · `rope` (a verlet rope you grab
& swing) · `pendulum-wave` (staggered-length pendulums drift in & out of phase) · `newtons-cradle`
(pull an end ball, momentum carries through) · `water-ripple` (a height-field surface that ripples &
reflects) · `gravity-wells` (particles orbit the pointer with luminous trails) · `magnetic-field`
(iron-filings re-orient along a pointer dipole) · `soft-body` (a poke-able jelly blob) ·
`plucked-string` (pluck it, it vibrates with a decaying wave) · `falling-sand` (pour colored grains
that pile into mounds)

**Components** (8)
`star-border` · `dock` · `marquee` · `card-swap` (3D deck, every slot a pure function of depth) ·
`gooey-nav` (indicator stretches in flight, fused by an SVG goo filter) · `bento-grid` (one pointer
listener for the whole grid, shared with tiles as inherited custom properties) · `elastic-slider`
(exponentially damped overshoot, full `role="slider"` keyboard contract) · `circular-gallery`
(drag converted through arc length, so tracking is 1:1 at any radius)

### Shaders without a shader library

The six shader components share a `useShader()` primitive — a raw WebGL2 runtime in ~290 lines
with **no `ogl`, no `three`, and no new dependencies**. It draws one full-screen triangle from
`gl_VertexID` (nothing to allocate, nothing to leak) and owns DPR-clamped sizing, suspension while
off-screen, pause on tab blur, context-loss recovery, eased pointer input, and the single still
frame reduced-motion users get. When WebGL2 is unavailable it reports `supported: false` so the
component renders a CSS fallback rather than a blank box.

```tsx
import { LiquidMetal } from "@/components/reactomega/liquid-metal";

<div className="h-[60vh]"><LiquidMetal tint="#c9d4ff" /></div>;
```

Each ships a structured contract in the registry: description, tags, npm + primitive
dependencies, and the source. Browse [`registry.json`](registry.json) or any
[`public/r/<name>.json`](public/r).

```tsx
import { SplitText } from "@/components/reactomega/split-text";

<SplitText text="Build something memorable." by="words" />;
```

---

## For AI agents & MCP

ReactOmega ships the machine layer react-bits doesn't:

- [`registry.json`](registry.json) — the full index (every component + deps + file targets).
- [`public/r/<name>.json`](public/r) — per-component shadcn-compatible items with inlined source.
- [`llms.txt`](llms.txt) — a token-efficient guide AI tools read directly.
- [`mcp/`](mcp) — an MCP server: `list_components`, `get_component`, `add_component`.

The registry is generated deterministically from source (`registry/meta.json` + the component
files) by [`scripts/build-registry.mjs`](scripts/build-registry.mjs) — one source of truth, so the
CLI, shadcn, and the MCP server can never drift.

---

## Develop

```bash
git clone https://github.com/Edwson/ReactOmega && cd ReactOmega
node scripts/build-registry.mjs                 # regenerate registry.json + public/r/*.json + llms.txt
node cli/index.mjs list --registry .            # run the CLI against your checkout
node mcp/test-mcp.mjs                            # end-to-end MCP test (needs @modelcontextprotocol/sdk)
```

Add a component: drop `registry/reactomega/ui/<name>.tsx`, describe it in
`registry/meta.json`, run `build-registry.mjs`. Reduced-motion safety and the `@/lib/utils` /
`@/hooks` import convention are the only rules.

> **Note:** the legacy cosmic `packages/ui` backgrounds are deprecated in favor of this registry
> and the [GalaxyJS](https://github.com/Edwson/GalaxyJS) library, and will be migrated out as the
> docs site is rebuilt.

---

## License

MIT © [Ed Chen](https://www.edwson.com)
