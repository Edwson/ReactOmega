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
          {DEMOS.length} copy-paste components across text, interaction, classics, and real physics. Hover, click and
          drag — every demo below is live. Copy the install command on any card.
        </p>

        {CATEGORIES.map((cat) => {
          const items = DEMOS.filter((d) => d.category === cat.id);
          if (!items.length) return null;
          return (
            <section key={cat.id} className="mt-14">
              <div className="mb-5 flex items-baseline gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">{cat.label}</h2>
                <span className="text-xs text-neutral-600">{items.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((d) => (
                  <div
                    key={d.name}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 transition-colors hover:border-violet-500/40"
                  >
                    <InView className="relative h-52 w-full">{d.node}</InView>
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

      <footer className="border-t border-white/10 py-10 text-center text-sm text-neutral-500">
        MIT © <a className="hover:text-white" href="https://www.edwson.com">Ed Chen</a> · ReactΩ
      </footer>
    </main>
  );
}
