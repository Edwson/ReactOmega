# Getting Started with ReactOmega

ReactOmega is a **copy-paste component registry** (like shadcn/ui and react-bits): you don't
install a black-box package, you add the components you want straight into your project and own
the code. It targets **React + TypeScript + Tailwind**.

## 1. Add a component

```bash
# the ReactOmega CLI
npx reactomega add split-text magnetic tilt-card

# …or via shadcn (works the moment the registry is published)
npx shadcn@latest add https://cdn.jsdelivr.net/gh/Edwson/ReactOmega@main/public/r/split-text.json
```

Each component lands in `components/reactomega/<name>.tsx` and automatically brings its
primitives: `lib/utils.ts` (the `cn()` helper) and `hooks/use-prefers-reduced-motion.ts`.

Browse what's available:

```bash
npx reactomega list
npx reactomega list --category interaction
```

## 2. Install the peer packages

The only runtime packages are for the `cn()` helper:

```bash
npm install clsx tailwind-merge
```

(React and Tailwind are assumed to already be in your app.)

## 3. Make sure your `@/*` alias is set

Components import from `@/lib/utils` and `@/hooks/...`. In `tsconfig.json`:

```jsonc
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./*"] } } }
```

(Next.js + the shadcn convention already use this.)

## 4. Use it

```tsx
import { SplitText } from "@/components/reactomega/split-text";
import { Magnetic } from "@/components/reactomega/magnetic";

export default function Hero() {
  return (
    <Magnetic strength={28}>
      <SplitText text="Build something memorable." by="words" className="text-5xl font-bold" />
    </Magnetic>
  );
}
```

Every component honors `prefers-reduced-motion` and is screen-reader aware out of the box.

## For AI agents

Add the MCP server to Claude Desktop / Cursor and ask it to install components for you:

```json
{ "mcpServers": { "reactomega": { "command": "npx", "args": ["-y", "github:Edwson/ReactOmega", "reactomega-mcp"] } } }
```

Tools: `list_components`, `get_component`, `add_component`. The agent gets structured contracts
(props, dependencies, source) — not just a docs page to read.

---

See the [README](README.md) for the full picture, or [`registry.json`](registry.json) /
[`llms.txt`](llms.txt) for the machine-readable index.
