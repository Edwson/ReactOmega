#!/usr/bin/env node
/**
 * test-mcp.mjs — end-to-end MCP test. Boots the real server.mjs over stdio with
 * the SDK client and exercises every tool the way an agent would. Requires the SDK.
 * Run: node mcp/test-mcp.mjs   (exit 0 = pass)
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const here = dirname(fileURLToPath(import.meta.url));
let fails = 0;
const ok = (c, m) => { if (c) console.log("  ✓ " + m); else { console.error("  ✗ " + m); fails++; } };
const sc = (r) => r.structuredContent || JSON.parse(r.content[0].text);

const transport = new StdioClientTransport({ command: process.execPath, args: [join(here, "server.mjs")], cwd: join(here, "..") });
const client = new Client({ name: "reactomega-itest", version: "1.0.0" });

try {
  await client.connect(transport);
  ok(true, "initialize handshake completed");

  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  ok(tools.length === 3 && ["add_component", "get_component", "list_components"].every((n) => tools.includes(n)), "advertises 3 tools");

  const list = sc(await client.callTool({ name: "list_components", arguments: {} }));
  ok(Array.isArray(list.results) && list.results.length === 31, `list_components returns 31 (got ${list.results?.length})`);

  const filtered = sc(await client.callTool({ name: "list_components", arguments: { category: "text" } }));
  ok(filtered.results.length === 10 && filtered.results.every((c) => c.category === "text"), "list_components filters by category (10 text)");

  const physics = sc(await client.callTool({ name: "list_components", arguments: { category: "physics" } }));
  ok(physics.results.length === 12 && physics.results.every((c) => c.category === "physics"), "list_components returns 12 physics components");

  const get = sc(await client.callTool({ name: "get_component", arguments: { name: "split-text" } }));
  ok(get.name === "split-text" && get.files?.[0]?.content?.includes("export function SplitText"), "get_component returns the source");
  ok(get.registryDependencies.includes("utils") && get.registryDependencies.includes("use-prefers-reduced-motion"), "get_component resolves primitive deps");

  const add = sc(await client.callTool({ name: "add_component", arguments: { name: "magnetic" } }));
  const targets = add.files.map((f) => f.target).sort();
  ok(targets.includes("lib/utils.ts") && targets.includes("hooks/use-prefers-reduced-motion.ts") && targets.includes("components/reactomega/magnetic.tsx"), "add_component bundles component + primitives");
  ok(/npx reactomega add magnetic/.test(add.install.cli) && /shadcn/.test(add.install.shadcn), "add_component returns install commands");

  const bad = await client.callTool({ name: "get_component", arguments: { name: "does-not-exist" } });
  ok(bad.isError === true, "unknown component sets isError");

  await client.close();
} catch (e) {
  console.error("  ✗ integration error:", e && e.message);
  fails++;
  try { await client.close(); } catch { /* closing */ }
}

console.log(fails === 0 ? "\nPASS — the ReactOmega MCP server speaks the protocol end-to-end." : `\nFAIL — ${fails} check(s) failed.`);
process.exit(fails === 0 ? 0 : 1);
