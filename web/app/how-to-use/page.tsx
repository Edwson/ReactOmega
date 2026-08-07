"use client";

import { useEffect, useRef, useState } from "react";

import { Nav } from "@/components/site/nav";
import { CopyButton } from "@/components/site/copy-button";
import { DEMOS } from "@/components/site/demos";

/* A code block that is copyable, because a docs page nobody can copy from is a
 * screenshot. `label` names the block in its header; the body is what it copies. */
function Code({ children, label }: { children: string; label?: string }) {
  const body = children.trim();
  const pre = useRef<HTMLPreElement>(null);
  /* A cut-off line reads as broken text unless something says "there is more
   * to the right". Only shown when the block actually overflows. */
  const [clipped, setClipped] = useState(false);
  useEffect(() => {
    const el = pre.current;
    if (!el) return;
    const measure = () => setClipped(el.scrollWidth > el.clientWidth + 1 && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [body]);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#08080f]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">{label ?? "shell"}</span>
        <CopyButton text={body} label={null} className="border-0 bg-transparent px-2 py-1" />
      </div>
      <div className="relative">
        <pre
          ref={pre}
          className="overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-neutral-300"
        >
          <code>{body}</code>
        </pre>
        <div
          aria-hidden
          className={
            "pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#08080f] to-transparent transition-opacity duration-200 " +
            (clipped ? "opacity-100" : "opacity-0")
          }
        />
      </div>
    </div>
  );
}

function Step({ n, title, children, accent }: { n: string; title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <section className="relative border-t border-white/10 pt-8">
      <div className="mb-5 flex items-baseline gap-3">
        <span
          className={
            "font-mono text-[11px] tracking-[0.2em] " + (accent ? "text-violet-400" : "text-neutral-600")
          }
        >
          {n}
        </span>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {accent ? (
          <span className="rounded-full border border-violet-500/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-violet-300">
            recommended
          </span>
        ) : null}
      </div>
      <div className="space-y-4 text-[15px] leading-relaxed text-neutral-400">{children}</div>
    </section>
  );
}

const MCP_CONFIG = `{
  "mcpServers": {
    "reactomega": {
      "command": "npx",
      "args": ["-y", "github:Edwson/ReactOmega", "reactomega-mcp"]
    }
  }
}`;

export default function HowToUsePage() {
  const shaderCount = DEMOS.filter((d) => d.category === "shader").length;

  return (
    <main>
      <Nav />

      <div className="mx-auto max-w-3xl px-5 py-14">
        <header className="pb-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-400">How to use</div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Install {DEMOS.length} components — <span className="text-violet-400">by agent</span> or by hand.
          </h1>
          <p className="mt-5 text-balance text-[17px] leading-relaxed text-neutral-400">
            ReactOmega is not an <span className="font-mono text-neutral-300">npm install</span>. Every component is one
            self-contained file that gets <b className="font-semibold text-neutral-200">copied into your repo</b> — you own
            it, you edit it, nothing updates behind your back. There are four ways to get it there. The first one is why
            this registry exists.
          </p>
        </header>

        {/* ── prerequisites ───────────────────────────────────────────── */}
        <Step n="00" title="What your project needs first">
          <p>
            Four things, and the installer assumes all of them. Get these wrong and the component lands but does not
            compile — that is the single most common failure, so it is worth thirty seconds now.
          </p>
          <ul className="space-y-2.5">
            {[
              ["React 18 or 19", "Every component is a client component and starts with \"use client\"."],
              ["Tailwind CSS", "Styling is Tailwind utility classes. No CSS file ships with the component."],
              ["A @/* path alias", "Components import from @/lib/utils and @/hooks/*. Without the alias the imports fail."],
              ["clsx + tailwind-merge", "The cn() primitive depends on them. The installer prints the npm line for you."],
            ].map(([k, v]) => (
              <li key={k} className="flex gap-3">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                <span>
                  <b className="font-semibold text-neutral-200">{k}</b> — {v}
                </span>
              </li>
            ))}
          </ul>
          <p>
            If your <span className="font-mono text-neutral-300">tsconfig.json</span> came from{" "}
            <span className="font-mono text-neutral-300">create-next-app</span>, the alias is already there. Otherwise:
          </p>
          <Code label="tsconfig.json">{`{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}`}</Code>
        </Step>

        {/* ── ① MCP ───────────────────────────────────────────────────── */}
        <Step n="01" title="MCP — let the agent install it" accent>
          <p>
            This is the path ReactOmega was built for. The registry ships an{" "}
            <b className="font-semibold text-neutral-200">MCP server</b>, so Claude or Cursor does not read these docs and
            guess — it queries a structured contract and writes the exact files. Add this once:
          </p>
          <Code label="mcp config">{MCP_CONFIG}</Code>
          <p className="text-sm">
            Put it in <span className="font-mono text-neutral-300">claude_desktop_config.json</span> for Claude Desktop, in{" "}
            <span className="font-mono text-neutral-300">.mcp.json</span> at your project root for Claude Code, or under{" "}
            <span className="font-mono text-neutral-300">Settings → MCP</span> in Cursor. Restart the client afterwards.
            Nothing is installed globally — <span className="font-mono text-neutral-300">npx</span> fetches the server on
            demand.
          </p>

          <div className="!mt-7 rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">then just ask</div>
            <div className="mt-3 space-y-2.5 font-mono text-[13px] text-neutral-300">
              <p>“add a ReactOmega magnetic button to my hero”</p>
              <p>“what ReactOmega shaders are there? install the glass one”</p>
              <p>“give me a scroll-driven reveal from ReactOmega”</p>
            </div>
          </div>

          <p className="!mt-7">The server exposes three tools. Your agent picks; you rarely need to name them:</p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            {[
              ["list_components", "category? · query?", "Browse or search the catalog. Returns name, title, category, description and tags."],
              ["get_component", "name", "The full contract for one component: description, tags, npm + registry dependencies, and the source."],
              ["add_component", "name", "Everything needed to install: both install commands, the npm line, and every file to write — component plus resolved primitives."],
            ].map(([tool, args, desc]) => (
              <div key={tool} className="border-b border-white/10 p-4 last:border-b-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <code className="font-mono text-[13px] font-semibold text-violet-300">{tool}</code>
                  <code className="font-mono text-[11px] text-neutral-500">{args}</code>
                </div>
                <p className="mt-1.5 text-sm text-neutral-400">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm">
            <b className="font-semibold text-neutral-200">Why this beats pasting from docs:</b>{" "}
            <span className="font-mono text-neutral-300">add_component</span> resolves the dependency chain itself. Ask for
            a shader and it returns four files — the component,{" "}
            <span className="font-mono text-neutral-300">lib/utils.ts</span>,{" "}
            <span className="font-mono text-neutral-300">hooks/use-prefers-reduced-motion.ts</span> and{" "}
            <span className="font-mono text-neutral-300">hooks/use-shader.ts</span> — because the shader needs the WebGL2
            primitive, which needs the reduced-motion hook. An agent reading prose forgets the third file. The registry
            cannot.
          </p>
        </Step>

        {/* ── ② CLI ───────────────────────────────────────────────────── */}
        <Step n="02" title="CLI — one line, no config">
          <p>Runs straight from GitHub. Nothing to install, nothing published to npm required.</p>
          <Code label="install">{`npx -y github:Edwson/ReactOmega add refracted-glass magnetic`}</Code>
          <p>Browse first, filter by category:</p>
          <Code label="browse">{`npx -y github:Edwson/ReactOmega list
npx -y github:Edwson/ReactOmega list --category shader`}</Code>
          <p className="text-sm">
            Useful flags: <span className="font-mono text-neutral-300">--dry</span> prints what it would write without
            touching disk, <span className="font-mono text-neutral-300">--cwd</span> targets another directory, and{" "}
            <span className="font-mono text-neutral-300">--registry</span> points at a local checkout or your own fork.
          </p>
        </Step>

        {/* ── ③ shadcn ────────────────────────────────────────────────── */}
        <Step n="03" title="shadcn — if that is already your workflow">
          <p>
            Every component is also a shadcn-compatible registry item, served over jsDelivr. Same files, your existing
            tool.
          </p>
          <Code label="shadcn">{`npx shadcn@latest add https://cdn.jsdelivr.net/gh/Edwson/ReactOmega@main/public/r/refracted-glass.json`}</Code>
          <p className="text-sm">
            Swap <span className="font-mono text-neutral-300">@main</span> for a tag such as{" "}
            <span className="font-mono text-neutral-300">@v1.2.0</span> to pin an immutable version.
          </p>
        </Step>

        {/* ── ④ manual ────────────────────────────────────────────────── */}
        <Step n="04" title="By hand — it is one file">
          <p>
            No tooling at all: open any component on the{" "}
            <a className="text-violet-400 underline decoration-violet-500/40 hover:text-violet-300" href="/components">
              components page
            </a>
            , copy the source from its registry item, and paste it in. You still need the primitives — the{" "}
            <span className="font-mono text-neutral-300">cn()</span> helper, the reduced-motion hook, and{" "}
            <span className="font-mono text-neutral-300">use-shader.ts</span> if it is one of the {shaderCount} shaders.
          </p>
          <Code label="registry item">{`https://cdn.jsdelivr.net/gh/Edwson/ReactOmega@main/public/r/<name>.json`}</Code>
        </Step>

        {/* ── where files land ────────────────────────────────────────── */}
        <Step n="05" title="Where the files land">
          <p>Whichever path you take, the layout is the same. Primitives are shared, so the second component is cheaper.</p>
          <Code label="your project">{`lib/utils.ts                         ← cn() · needs clsx + tailwind-merge
hooks/use-prefers-reduced-motion.ts  ← the accessibility contract
hooks/use-shader.ts                  ← only for shader components (raw WebGL2)
components/reactomega/<name>.tsx     ← the component itself`}</Code>
          <p>
            Then import it like any local file. Give a full-bleed component a sized parent — it fills its container, it
            does not invent a height:
          </p>
          <Code label="usage">{`import { RefractedGlass } from "@/components/reactomega/refracted-glass";

export default function Hero() {
  return (
    <div className="relative h-[70vh] overflow-hidden">
      <RefractedGlass tint="#c9d4ff" dispersion={1.2} />
    </div>
  );
}`}</Code>
          <p className="text-sm">
            Every prop is typed and documented inline with its default, so your editor tells you the options without a
            round trip to this page.
          </p>
        </Step>

        {/* ── contracts ───────────────────────────────────────────────── */}
        <Step n="06" title="Two guarantees you inherit">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-300">reduced motion</div>
              <p className="mt-2.5 text-sm text-neutral-400">
                Every component honors <span className="font-mono text-neutral-300">prefers-reduced-motion</span> and
                degrades to a calm, still, still-functional state. It is enforced by a test in CI, not a promise in a
                README — including transitively, so a shader inherits it from the primitive.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-300">graceful WebGL2</div>
              <p className="mt-2.5 text-sm text-neutral-400">
                Shaders ask for a WebGL2 context. If the browser cannot give one they render a CSS gradient in the same
                palette rather than a blank rectangle — so an old machine sees something composed, never something broken.
              </p>
            </div>
          </div>
        </Step>

        {/* ── troubleshooting ─────────────────────────────────────────── */}
        <Step n="07" title="If something does not work">
          <div className="overflow-hidden rounded-xl border border-white/10">
            {[
              [
                "Cannot find module '@/lib/utils'",
                "The @/* alias is missing from tsconfig.json, or your bundler is not reading it. See step 00.",
              ],
              [
                "The component renders but is unstyled",
                "Tailwind is not scanning components/reactomega. Add it to the content globs in your Tailwind config.",
              ],
              [
                "A shader shows a flat gradient",
                "That is the fallback, working. The browser has no WebGL2 — check the console for a context warning.",
              ],
              [
                "Nothing animates",
                "Either the OS has reduce-motion on (that is the contract), or the parent has no height so the canvas is 0px tall.",
              ],
              [
                "\"You're importing a component that needs useState\"",
                "A server component imported it. The component already declares \"use client\"; the file importing it needs to be a client component too, or render it from one.",
              ],
            ].map(([sym, fix]) => (
              <div key={sym} className="border-b border-white/10 p-4 last:border-b-0">
                <div className="font-mono text-[12.5px] text-amber-300/90">{sym}</div>
                <p className="mt-1.5 text-sm text-neutral-400">{fix}</p>
              </div>
            ))}
          </div>
        </Step>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-white/10 pt-9">
          <a
            href="/components"
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Browse all {DEMOS.length} components →
          </a>
          <a
            href="https://github.com/Edwson/ReactOmega"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/15 px-6 py-3 font-semibold transition-colors hover:border-violet-500/50"
          >
            Source on GitHub ↗
          </a>
        </div>
      </div>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-neutral-500">
        MIT © <a className="hover:text-white" href="https://www.edwson.com">Ed Chen</a> · ReactΩ
      </footer>
    </main>
  );
}
