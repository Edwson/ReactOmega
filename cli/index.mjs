#!/usr/bin/env node
/**
 * reactomega — the ReactOmega CLI.
 *
 * Copies a component (and its primitive dependencies) straight into your project,
 * shadcn-style: you own the code. Zero runtime dependencies (Node 18+ built-ins).
 *
 *   npx reactomega list [--category text|interaction|components]
 *   npx reactomega add split-text magnetic [--cwd .] [--registry <url|dir>] [--dry]
 *
 * --registry defaults to the published registry on jsDelivr; pass a local path
 * (the repo root) to run against your own checkout.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, isAbsolute, resolve } from "node:path";

const DEFAULT_SRC = "https://cdn.jsdelivr.net/gh/Edwson/ReactOmega@main";

const args = process.argv.slice(2);
const cmd = args[0];
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : def;
};
const has = (name) => args.includes(`--${name}`);
const positionals = args.slice(1).filter((a, i, arr) => !a.startsWith("--") && (i === 0 || !arr[i - 1].startsWith("--") || ["dry"].includes(arr[i - 1].replace(/^--/, ""))));

const SRC = flag("registry", DEFAULT_SRC);
const isHttp = /^https?:\/\//.test(SRC);

async function load(relpath) {
  if (isHttp) {
    const r = await fetch(`${SRC}/${relpath}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`registry fetch ${r.status}: ${relpath}`);
    return r.json();
  }
  const base = isAbsolute(SRC) ? SRC : resolve(process.cwd(), SRC);
  return JSON.parse(readFileSync(join(base, relpath), "utf8"));
}

const depName = (urlOrName) => urlOrName.replace(/^.*\//, "").replace(/\.json$/, "");

async function getIndex() {
  return load("registry.json");
}

async function resolveItem(name, seen, out) {
  if (seen.has(name)) return;
  seen.add(name);
  const item = await load(`public/r/${name}.json`);
  for (const dep of item.registryDependencies || []) await resolveItem(depName(dep), seen, out);
  out.push(item);
}

function color(c, s) {
  const codes = { gray: 90, green: 32, cyan: 36, yellow: 33, bold: 1, violet: 35 };
  return process.stdout.isTTY ? `\x1b[${codes[c]}m${s}\x1b[0m` : s;
}

async function cmdList() {
  const reg = await getIndex();
  const category = flag("category");
  const comps = reg.items.filter((i) => i.type === "registry:component" && (!category || i.category === category));
  console.log(color("bold", `\nReactOmega v${reg.version} — ${comps.length} components\n`));
  const cats = ["text", "interaction", "components", "physics"];
  for (const cat of cats) {
    const inCat = comps.filter((i) => i.category === cat);
    if (!inCat.length) continue;
    console.log(color("violet", cat));
    for (const i of inCat) console.log(`  ${color("cyan", i.name.padEnd(16))} ${color("gray", i.description)}`);
    console.log("");
  }
  console.log(color("gray", `add one with:  npx reactomega add ${comps[0]?.name}\n`));
}

async function cmdAdd() {
  const names = positionals;
  if (!names.length) {
    console.error("usage: reactomega add <name...>   (run `reactomega list` to see names)");
    process.exit(1);
  }
  const cwd = resolve(process.cwd(), flag("cwd", "."));
  const dry = has("dry");
  const seen = new Set();
  const out = [];
  for (const n of names) {
    try {
      await resolveItem(n, seen, out);
    } catch (e) {
      console.error(color("yellow", `! ${n}: ${e.message}`));
      process.exit(1);
    }
  }
  const npmDeps = new Set();
  let written = 0;
  for (const item of out) {
    (item.dependencies || []).forEach((d) => npmDeps.add(d));
    for (const file of item.files) {
      const target = join(cwd, file.target || file.path);
      if (dry) {
        console.log(color("gray", `  would write ${file.target || file.path} (${file.content.length} bytes)`));
      } else {
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, file.content);
        console.log(`  ${color("green", "+")} ${file.target || file.path}`);
      }
      written++;
    }
  }
  console.log(color("bold", `\n${dry ? "[dry run] " : ""}${written} file(s) for: ${names.join(", ")}`));
  if (npmDeps.size) console.log(color("gray", `npm install ${[...npmDeps].sort().join(" ")}`));
  console.log(color("gray", "Components import from @/lib/utils and @/hooks — ensure your tsconfig has the @/* alias.\n"));
}

(async () => {
  try {
    if (cmd === "list" || cmd === "ls") await cmdList();
    else if (cmd === "add") await cmdAdd();
    else {
      console.log(`reactomega — copy premium React components into your project

  reactomega list [--category text|interaction|components]
  reactomega add <name...> [--cwd .] [--registry <url|dir>] [--dry]

Registry: ${SRC}
Docs: https://github.com/Edwson/ReactOmega`);
    }
  } catch (e) {
    console.error("error:", e && e.message);
    process.exit(1);
  }
})();
