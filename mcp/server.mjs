#!/usr/bin/env node
/**
 * reactomega-mcp — the ReactOmega component registry over the Model Context Protocol.
 *
 * Lets an AI agent (Claude, Cursor, …) discover and install ReactOmega components
 * with structured contracts: list_components, get_component, add_component. A thin
 * adapter over registry-core.mjs (the pure engine), so the MCP tools and the library
 * never drift. Speaks MCP over stdio. Requires Node 18+ and `@modelcontextprotocol/sdk`.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadRegistry } from "./registry-core.mjs";

const reg = loadRegistry();
const VERSION = reg.version;

const argv = process.argv.slice(2);
if (argv.includes("--version") || argv.includes("-v")) {
  process.stdout.write(VERSION + "\n");
  process.exit(0);
}
if (argv.includes("--help") || argv.includes("-h")) {
  process.stdout.write(
    `reactomega-mcp v${VERSION} — the ReactOmega registry over MCP\n\n` +
      `Tools: list_components · get_component · add_component\n` +
      `Run:   node mcp/server.mjs   (speaks MCP over stdio)\n`,
  );
  process.exit(0);
}

const ok = (obj) => ({ content: [{ type: "text", text: JSON.stringify(obj, null, 2) }], structuredContent: obj });
const fail = (msg) => ({ content: [{ type: "text", text: String(msg) }], isError: true });

const server = new McpServer({ name: "reactomega", version: VERSION });

server.registerTool(
  "list_components",
  {
    title: "List ReactOmega components",
    description: "List every component (name, title, category, description, tags). Optionally filter by category or a keyword query.",
    inputSchema: {
      category: z.enum(["text", "interaction", "components", "physics"]).optional().describe("Restrict to one category."),
      query: z.string().optional().describe("Case-insensitive keyword across name/title/description/tags."),
    },
  },
  async ({ category, query }) => ok({ version: VERSION, results: reg.listComponents({ category, query }) }),
);

server.registerTool(
  "get_component",
  {
    title: "Get a ReactOmega component",
    description: "Full contract for one component: description, tags, npm + registry dependencies, and the source file(s).",
    inputSchema: { name: z.string().describe("Component name, e.g. 'split-text'.") },
  },
  async ({ name }) => {
    const r = reg.getComponent(name);
    return r.error ? fail(`${r.error}. Available: ${r.available.join(", ")}`) : ok(r);
  },
);

server.registerTool(
  "add_component",
  {
    title: "Add a ReactOmega component",
    description: "Everything needed to install a component: the install commands (reactomega CLI + shadcn), the npm install line, and the full set of files (component + resolved primitives) ready to write into a project.",
    inputSchema: { name: z.string().describe("Component name, e.g. 'magnetic'.") },
  },
  async ({ name }) => {
    const r = reg.addComponent(name);
    return r.error ? fail(`${r.error}. Available: ${r.available.join(", ")}`) : ok(r);
  },
);

await server.connect(new StdioServerTransport());
const s = reg.stats();
console.error(`reactomega-mcp v${VERSION} ready (stdio) — ${s.components} components, 3 tools`);
