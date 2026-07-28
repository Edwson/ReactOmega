"use client";

import Link from "next/link";
import { Nav } from "@/components/site/nav";
import { CopyButton } from "@/components/site/copy-button";
import { InView } from "@/components/site/in-view";
import { DotGrid } from "@/components/reactomega/dot-grid";
import { MagneticText } from "@/components/reactomega/magnetic-text";
import { GradientText } from "@/components/reactomega/gradient-text";
import { ShinyText } from "@/components/reactomega/shiny-text";
import { VariableProximity } from "@/components/reactomega/variable-proximity";
import { GravityText } from "@/components/reactomega/gravity-text";
import { SpringMesh } from "@/components/reactomega/spring-mesh";
import { Metaballs } from "@/components/reactomega/metaballs";
import { LiquidMetal } from "@/components/reactomega/liquid-metal";
import { ThinFilm } from "@/components/reactomega/thin-film";
import { CurlFlow } from "@/components/reactomega/curl-flow";
import { Caustics } from "@/components/reactomega/caustics";
import { DEMOS } from "@/components/site/demos";

const FEATURED = [
  { title: "variable-proximity", node: <div className="flex h-full w-full items-center justify-center"><VariableProximity text="Hover me" className="text-3xl font-extrabold" /></div> },
  { title: "gravity-text", node: <div className="flex h-full w-full items-center justify-center"><GravityText text="Let it fall" trigger="hover" className="text-2xl font-bold" /></div> },
  { title: "liquid-metal", node: <LiquidMetal /> },
  { title: "spring-mesh", node: <SpringMesh /> },
  { title: "metaballs", node: <Metaballs /> },
];

const SHADERS = [
  { title: "thin-film", blurb: "Real thin-film interference, not a hue rotation.", node: <ThinFilm /> },
  { title: "curl-flow", blurb: "Divergence-free curl noise, advected into silk.", node: <CurlFlow /> },
  { title: "caustics", blurb: "Folded coordinates focused into light filaments.", node: <Caustics /> },
];

const WHY = [
  { h: "You own the code", p: "Like shadcn/ui, every component is one self-contained file copied into your repo. No black-box package, no lock-in." },
  { h: "AI-native", p: "A machine-readable registry + an MCP server, so AI agents (Claude, Cursor) install components with structured contracts — not just humans reading docs." },
  { h: "Accessible by contract", p: "Every component honors prefers-reduced-motion and is screen-reader aware. It's a test, not a footnote." },
];

export default function Home() {
  return (
    <main>
      <Nav />

      {/* hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-5">
        <div className="absolute inset-0 opacity-60">
          <DotGrid gap={34} radius={150} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#06060a]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            AI-native React registry · {DEMOS.length} components
          </span>

          <h1 className="mt-7 select-none text-7xl font-black tracking-tight sm:text-8xl">
            <MagneticText text="ReactΩ" strength={22} />
          </h1>

          <div className="mt-4 text-2xl font-bold sm:text-3xl">
            <GradientText speed={7}>Motion · Interaction · Physics</GradientText>
          </div>

          <p className="mx-auto mt-5 max-w-xl text-balance text-neutral-400">
            Premium, accessible React components you copy into your project — installable in one line by{" "}
            <span className="text-neutral-200">humans and AI agents</span>. Novel kinetic typography and tactile,
            real-physics interactions. A different lane from cosmic canvas libraries.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/components"
              className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-violet-500"
            >
              Browse components →
            </Link>
            <CopyButton text="npx reactomega add magnetic-text spring-mesh" className="px-4 py-3 text-sm" />
          </div>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <ShinyText text="install with" />
            {["CLI", "shadcn", "MCP"].map((t) => (
              <span key={t} className="rounded-md border border-white/10 px-2 py-1 font-mono text-neutral-300">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* why */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.h} className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
              <h3 className="text-lg font-semibold">{w.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{w.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* featured live */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">A few, live</h2>
          <Link href="/components" className="text-sm text-violet-400 hover:text-violet-300">
            See all {DEMOS.length} →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((f) => (
            <Link
              key={f.title}
              href="/components"
              className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 transition-colors hover:border-violet-500/40"
            >
              <InView className="relative h-44 w-full">{f.node}</InView>
              <div className="border-t border-white/10 px-4 py-3 font-mono text-xs text-neutral-400 group-hover:text-neutral-200">
                {f.title}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* shaders — the v1.1 headline, and the reason the zero-dependency claim is worth something */}
      <section className="border-t border-white/10 bg-[#08080e]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Shaders, without a shader library</h2>
              <p className="mt-2 max-w-xl text-sm text-neutral-400">
                Six full-screen fragment shaders on hand-written GLSL and raw WebGL2 — no ogl, no three, still zero
                runtime dependencies. A shared <span className="font-mono text-neutral-300">useShader</span> primitive
                owns sizing, off-screen suspension, context-loss recovery and the still frame reduced-motion users get.
              </p>
            </div>
            <Link href="/components" className="shrink-0 text-sm text-violet-400 hover:text-violet-300">
              All six →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {SHADERS.map((sh) => (
              <div key={sh.title} className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
                <InView className="relative h-56 w-full">{sh.node}</InView>
                <div className="border-t border-white/10 px-4 py-3">
                  <div className="font-mono text-xs text-neutral-300">{sh.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">{sh.blurb}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-neutral-500">
        MIT © <a className="hover:text-white" href="https://www.edwson.com">Ed Chen</a> · the AI-native React component
        registry · <a className="hover:text-white" href="https://github.com/Edwson/ReactOmega">GitHub</a>
      </footer>
    </main>
  );
}
