#!/usr/bin/env node
/**
 * build-registry.mjs — generate the ReactOmega registry from source.
 *
 * Single source of truth: registry/meta.json + the component files. This emits
 *   - public/r/<name>.json   shadcn-compatible registry items (with inlined content)
 *   - registry.json          the browsable index (also a shadcn registry)
 *   - llms.txt               a token-efficient guide AI agents read directly
 *
 * Deterministic: stable key order, no timestamps — so CI can `git diff --exit-code`.
 * Run: node scripts/build-registry.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const meta = JSON.parse(read("registry/meta.json"));
const VERSION = meta.version;

// Where registryDependencies point + where the CLI/shadcn fetch items from.
const BASE =
  process.env.REACTOMEGA_REGISTRY_BASE ||
  "https://cdn.jsdelivr.net/gh/Edwson/ReactOmega@main/public/r";

const HOMEPAGE = "https://github.com/Edwson/ReactOmega";
const COMPONENT_TARGET = (name) => `components/reactomega/${name}.tsx`;

// ----- collect primitives (utils, hook) -----
const primitiveItems = {};
for (const [name, p] of Object.entries(meta.primitives)) {
  primitiveItems[name] = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: p.type,
    title: p.title,
    description: p.description,
    dependencies: p.dependencies,
    registryDependencies: p.uses.map((u) => `${BASE}/${u}.json`),
    files: [{ path: p.target, type: p.type, target: p.target, content: read(p.source) }],
  };
}

// ----- collect components -----
const componentItems = {};
for (const [name, c] of Object.entries(meta.components)) {
  const source = read(`registry/reactomega/ui/${name}.tsx`);
  componentItems[name] = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:component",
    title: c.title,
    description: c.description,
    dependencies: c.dependencies,
    registryDependencies: c.uses.map((u) => `${BASE}/${u}.json`),
    files: [
      {
        path: COMPONENT_TARGET(name),
        type: "registry:component",
        target: COMPONENT_TARGET(name),
        content: source,
      },
    ],
    meta: { category: c.category, tags: c.tags },
  };
}

// ----- write per-item JSON -----
mkdirSync(join(root, "public/r"), { recursive: true });
const allItems = { ...primitiveItems, ...componentItems };
for (const [name, item] of Object.entries(allItems)) {
  writeFileSync(join(root, `public/r/${name}.json`), JSON.stringify(item, null, 2) + "\n");
}

// ----- registry index (lightweight, no inlined content) -----
const indexItem = (name, item, c) => ({
  name,
  type: item.type,
  title: item.title,
  description: item.description,
  ...(c ? { category: c.category, tags: c.tags } : {}),
  dependencies: item.dependencies,
  registryDependencies: item.registryDependencies,
  files: item.files.map((f) => ({ path: f.path, type: f.type, target: f.target })),
});

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "reactomega",
  version: VERSION,
  homepage: HOMEPAGE,
  base: BASE,
  items: [
    ...Object.keys(meta.primitives).map((n) => indexItem(n, primitiveItems[n], null)),
    ...Object.keys(meta.components).map((n) => indexItem(n, componentItems[n], meta.components[n])),
  ],
};
writeFileSync(join(root, "registry.json"), JSON.stringify(registry, null, 2) + "\n");

// ----- llms.txt -----
const byCat = {};
for (const [n, c] of Object.entries(meta.components)) (byCat[c.category] ||= []).push([n, c]);
const catTitle = { text: "Text Animations", interaction: "Interaction & Motion", components: "Components", physics: "Physics & Art" };
const lines = [];
lines.push("# ReactOmega");
lines.push("");
lines.push(`> AI-native React component registry — premium, accessible, reduced-motion-safe motion & interaction components. v${VERSION}. Install any component in one line via the ReactOmega CLI, shadcn, or an MCP server. Source of truth: /registry.json.`);
lines.push("");
lines.push("## Install a component");
lines.push("```");
lines.push("npx reactomega add <name>            # the ReactOmega CLI");
lines.push(`npx shadcn@latest add ${BASE}/<name>.json   # via shadcn`);
lines.push("```");
lines.push("Every component is a self-contained file copied into your project (you own the code). They use Tailwind + a tiny cn() helper, honor prefers-reduced-motion, and are screen-reader aware.");
lines.push("");
for (const cat of ["text", "interaction", "components", "physics"]) {
  if (!byCat[cat]) continue;
  lines.push(`## ${catTitle[cat]}`);
  for (const [n, c] of byCat[cat]) lines.push(`- \`${n}\` — ${c.description}`);
  lines.push("");
}
lines.push("## Primitives (added automatically as dependencies)");
for (const [n, p] of Object.entries(meta.primitives)) lines.push(`- \`${n}\` — ${p.description}`);
lines.push("");
lines.push("## Machine-readable & MCP");
lines.push(`- Registry index: [/registry.json](registry.json) — every component with deps + file targets.`);
lines.push(`- Per-component item (with source): ${BASE}/<name>.json`);
lines.push(`- MCP server: \`npx -y github:Edwson/ReactOmega reactomega-mcp\` — tools: list_components, get_component, add_component.`);
lines.push("");
lines.push("MIT © Ed Chen (https://www.edwson.com).");
writeFileSync(join(root, "llms.txt"), lines.join("\n") + "\n");

const counts = {
  components: Object.keys(meta.components).length,
  primitives: Object.keys(meta.primitives).length,
};
console.log(`registry built: ${counts.components} components + ${counts.primitives} primitives → public/r/*.json, registry.json, llms.txt`);
