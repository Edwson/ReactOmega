#!/usr/bin/env node
/**
 * test-registry.mjs — dependency-free registry test (runs in CI, no SDK).
 *
 * Verifies the generated registry agrees with the source, every dependency
 * resolves, and every component honors the reduced-motion accessibility
 * contract. Catches "forgot to rebuild the registry" before it ships.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));

let fails = 0;
const ok = (c, m) => { if (c) console.log("  ✓ " + m); else { console.error("  ✗ " + m); fails++; } };

const meta = json("registry/meta.json");
const registry = json("registry.json");
const compNames = Object.keys(meta.components);
const primNames = Object.keys(meta.primitives);

console.log("index");
ok(registry.name === "reactomega", "registry name is reactomega");
ok(registry.version === meta.version, `registry version matches meta (${registry.version})`);
ok(registry.items.length === compNames.length + primNames.length, `index lists every item (${registry.items.length})`);

console.log("per-item integrity + source sync");
for (const name of compNames) {
  const item = json(`public/r/${name}.json`);
  const src = read(`registry/reactomega/ui/${name}.tsx`);
  ok(item.files?.[0]?.content === src, `${name}: registry content is in sync with source`);
  const deps = (item.registryDependencies || []).map((u) => u.replace(/^.*\//, "").replace(/\.json$/, ""));
  ok(deps.every((d) => primNames.includes(d) || compNames.includes(d)), `${name}: every registry dependency resolves`);
  ok(item.files[0].target === `components/reactomega/${name}.tsx`, `${name}: file target is correct`);
}
for (const name of primNames) ok(existsSync(join(root, `public/r/${name}.json`)), `primitive ${name} has a registry item`);

console.log("accessibility contract (reduced-motion)");
for (const name of compNames) {
  const src = read(`registry/reactomega/ui/${name}.tsx`);
  const honored = /prefers-reduced-motion/.test(src) || /use-prefers-reduced-motion/.test(src);
  ok(honored, `${name}: honors prefers-reduced-motion`);
}

console.log("llms.txt");
const llms = read("llms.txt");
ok(compNames.every((n) => llms.includes(n)), "llms.txt mentions every component");

console.log(fails === 0 ? "\nPASS — registry is valid, in sync, dependency-resolved, and reduced-motion safe." : `\nFAIL — ${fails} check(s) failed.`);
process.exit(fails === 0 ? 0 : 1);
