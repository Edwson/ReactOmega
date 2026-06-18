/**
 * registry-core.mjs — the pure engine behind the ReactOmega MCP server.
 *
 * Reads the generated registry (registry.json + public/r/*.json) and answers
 * questions about components. No SDK, no network — so it imports as a plain
 * library and is unit-testable. server.mjs is a thin MCP adapter over this.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

export function loadRegistry() {
  const index = read("registry.json");
  const VERSION = index.version;
  const BASE = index.base;

  const items = index.items;
  const components = items.filter((i) => i.type === "registry:component");

  const getItem = (name) => read(`public/r/${name}.json`); // full item incl file content
  const exists = (name) => items.some((i) => i.name === name);

  return {
    version: VERSION,
    base: BASE,

    listComponents({ category, query } = {}) {
      let list = components;
      if (category) list = list.filter((c) => c.category === category);
      if (query) {
        const q = String(query).toLowerCase();
        list = list.filter(
          (c) =>
            c.name.includes(q) ||
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            (c.tags || []).some((t) => t.includes(q)),
        );
      }
      return list.map((c) => ({ name: c.name, title: c.title, category: c.category, description: c.description, tags: c.tags }));
    },

    getComponent(name) {
      if (!exists(name)) return { error: `unknown component: ${name}`, available: components.map((c) => c.name) };
      const item = getItem(name);
      // resolve primitive deps by name
      const deps = (item.registryDependencies || []).map((u) => u.replace(/^.*\//, "").replace(/\.json$/, ""));
      return {
        name: item.name,
        title: item.title,
        category: item.meta?.category,
        description: item.description,
        tags: item.meta?.tags || [],
        npmDependencies: item.dependencies || [],
        registryDependencies: deps,
        files: item.files.map((f) => ({ target: f.target, content: f.content })),
      };
    },

    addComponent(name) {
      const c = this.getComponent(name);
      if (c.error) return c;
      // resolve the full file set including primitives, deduped
      const seen = new Set();
      const files = [];
      const npm = new Set();
      const walk = (n) => {
        if (seen.has(n)) return;
        seen.add(n);
        const item = getItem(n);
        (item.registryDependencies || [])
          .map((u) => u.replace(/^.*\//, "").replace(/\.json$/, ""))
          .forEach(walk);
        (item.dependencies || []).forEach((d) => npm.add(d));
        for (const f of item.files) files.push({ target: f.target, content: f.content });
      };
      walk(name);
      return {
        name,
        install: {
          cli: `npx reactomega add ${name}`,
          shadcn: `npx shadcn@latest add ${BASE}/${name}.json`,
        },
        npmInstall: npm.size ? `npm install ${[...npm].sort().join(" ")}` : null,
        files,
      };
    },

    stats() {
      const byCat = {};
      for (const c of components) byCat[c.category] = (byCat[c.category] || 0) + 1;
      return { version: VERSION, components: components.length, byCategory: byCat };
    },
  };
}
