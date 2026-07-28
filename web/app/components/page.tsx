"use client";

import { Nav } from "@/components/site/nav";
import { CopyButton } from "@/components/site/copy-button";
import { InView } from "@/components/site/in-view";
import { DEMOS, CATEGORIES } from "@/components/site/demos";

export default function ComponentsPage() {
  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="text-4xl font-extrabold tracking-tight">Components</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          {DEMOS.length} copy-paste components across kinetic type, pointer interaction, cursors, scroll-driven
          motion, raw-WebGL2 shaders, real physics, and UI. Hover, click, drag and scroll — every demo below is live.
          Copy the install command on any card.
        </p>

        {CATEGORIES.map((cat) => {
          // Scroll-driven pieces that need the whole page are shown together at the
          // bottom — inlining them here would leave a screen of void in the grid.
          const items = DEMOS.filter((d) => d.category === cat.id && !d.tall);
          const deferred = DEMOS.filter((d) => d.category === cat.id && d.tall);
          if (!items.length) return null;
          return (
            <section key={cat.id} className="mt-14">
              <div className="mb-5 flex items-baseline gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">{cat.label}</h2>
                <span className="text-xs text-neutral-600">{items.length + deferred.length}</span>
                {deferred.length ? (
                  <a href="#full-height" className="text-xs text-neutral-500 hover:text-violet-400">
                    {deferred.length} more need the whole page ↓
                  </a>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((d) => (
                  <div
                    key={d.name}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 transition-colors hover:border-violet-500/40"
                  >
                    <InView className="relative h-52 w-full overflow-hidden">{d.node}</InView>
                    <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
                      <span className="text-sm font-medium">{d.title}</span>
                      <CopyButton text={`npx reactomega add ${d.name}`} label={d.name} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section id="full-height" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-5 flex items-baseline gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">Full height</h2>
          <span className="text-xs text-neutral-600">{DEMOS.filter((d) => d.tall).length}</span>
        </div>
        <p className="mb-6 max-w-2xl text-sm text-neutral-500">
          These two are driven by the page scroller and pin themselves to the viewport, so a 200px preview tile would
          tell you nothing. Scroll through them.
        </p>
        <div className="flex flex-col gap-5">
          {DEMOS.filter((d) => d.tall).map((d) => (
            <div key={d.name} className="rounded-2xl border border-white/10 bg-neutral-950">
              <div className="relative w-full">{d.node}</div>
              <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
                <span className="text-sm font-medium">{d.title}</span>
                <CopyButton text={`npx reactomega add ${d.name}`} label={d.name} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-neutral-500">
        MIT © <a className="hover:text-white" href="https://www.edwson.com">Ed Chen</a> · ReactΩ
      </footer>
    </main>
  );
}
