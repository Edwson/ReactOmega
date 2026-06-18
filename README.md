# ReactΩ — ReactOmega

**The AI-native React component registry.** Premium, accessible, reduced-motion-safe
**motion & interaction** components you copy into your project — installable in one line by
**humans _and_ AI agents**.

![Version](https://img.shields.io/badge/version-1.0.0-7c5cff)
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

**Live:** **https://edwson.github.io/ReactOmega/** — every one of the 31 components rendered live,
with a copy-paste install command on each card. The playground source lives in [`web/`](web)
(Next.js + Tailwind). To run it locally:

```bash
cd web
npm install
npm run dev        # → http://localhost:3000
```

## Components (v1.0) — 31

**Text Animations** (novel + deeply customizable kinetic typography)
`split-text` · `shiny-text` · `gradient-text` · `count-up` · `variable-proximity` (per-letter
variable-font axes by pointer distance) · `magnetic-text` (each letter springs to the pointer) ·
`gravity-text` (letters fall, bounce & reassemble with real gravity) · `elastic-text` (per-letter
jelly squash/stretch) · `scramble-text` (configurable decode) · `text-reveal` (scroll-linked
word-by-word brightening)

**Interaction & Motion**
`magnetic` · `spotlight-card` · `tilt-card` · `holographic-card` (iridescent foil + 3D tilt) ·
`click-spark` · `dot-grid`

**Components**
`star-border` · `dock` · `marquee`

**Physics & Art** (real physics — tactile, designed, never cosmic) — 12
`spring-mesh` (press an elastic lattice, waves ripple & settle) · `cloth` (a verlet fabric you grab
& wave) · `metaballs` (gooey fluid that merges around the pointer) · `rope` (a verlet rope you grab
& swing) · `pendulum-wave` (staggered-length pendulums drift in & out of phase) · `newtons-cradle`
(pull an end ball, momentum carries through) · `water-ripple` (a height-field surface that ripples &
reflects) · `gravity-wells` (particles orbit the pointer with luminous trails) · `magnetic-field`
(iron-filings re-orient along a pointer dipole) · `soft-body` (a poke-able jelly blob) ·
`plucked-string` (pluck it, it vibrates with a decaying wave) · `falling-sand` (pour colored grains
that pile into mounds)

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
