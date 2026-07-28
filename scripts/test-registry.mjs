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
// A component satisfies the contract either directly, or transitively through a
// primitive that does — useShader owns the whole WebGL lifecycle, including
// rendering a single still frame instead of a loop, so the shaders that build on
// it inherit the guarantee rather than restating it.
const honorsDirectly = (src) => /prefers-reduced-motion/.test(src);
const safePrimitives = new Set(primNames.filter((n) => honorsDirectly(read(meta.primitives[n].source))));
ok(safePrimitives.has("use-prefers-reduced-motion"), "the reduced-motion primitive honors the contract");
for (const name of compNames) {
  const src = read(`registry/reactomega/ui/${name}.tsx`);
  const via = (meta.components[name].uses || []).filter((u) => safePrimitives.has(u));
  const honored = honorsDirectly(src) || via.length > 0;
  ok(honored, `${name}: honors prefers-reduced-motion${!honorsDirectly(src) && via.length ? ` (via ${via.join(", ")})` : ""}`);
}

console.log("WebGL lifecycle");
// A canvas hands back the same context object on every getContext call, so calling
// WEBGL_lose_context in an effect cleanup poisons every later mount on that canvas:
// StrictMode re-runs effects in dev, and any dependency change re-runs them in prod.
// The failure is invisible to the compiler, to `next build`, and to a first render —
// it only shows up on the second mount, as a compile failure with a null info log.
for (const [name, p] of Object.entries(meta.primitives)) {
  ok(!/loseContext/.test(read(p.source)), `${name}: does not force-lose the WebGL context`);
}
for (const name of compNames) {
  ok(!/loseContext/.test(read(`registry/reactomega/ui/${name}.tsx`)), `${name}: does not force-lose the WebGL context`);
}

console.log("llms.txt");
const llms = read("llms.txt");
ok(compNames.every((n) => llms.includes(n)), "llms.txt mentions every component");

console.log(fails === 0 ? "\nPASS — registry is valid, in sync, dependency-resolved, and reduced-motion safe." : `\nFAIL — ${fails} check(s) failed.`);
process.exit(fails === 0 ? 0 : 1);
