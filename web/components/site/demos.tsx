"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SplitText } from "@/components/reactomega/split-text";
import { ShinyText } from "@/components/reactomega/shiny-text";
import { GradientText } from "@/components/reactomega/gradient-text";
import { CountUp } from "@/components/reactomega/count-up";
import { VariableProximity } from "@/components/reactomega/variable-proximity";
import { MagneticText } from "@/components/reactomega/magnetic-text";
import { GravityText } from "@/components/reactomega/gravity-text";
import { ElasticText } from "@/components/reactomega/elastic-text";
import { ScrambleText } from "@/components/reactomega/scramble-text";
import { TextReveal } from "@/components/reactomega/text-reveal";
import { Magnetic } from "@/components/reactomega/magnetic";
import { SpotlightCard } from "@/components/reactomega/spotlight-card";
import { TiltCard } from "@/components/reactomega/tilt-card";
import { HolographicCard } from "@/components/reactomega/holographic-card";
import { ClickSpark } from "@/components/reactomega/click-spark";
import { DotGrid } from "@/components/reactomega/dot-grid";
import { StarBorder } from "@/components/reactomega/star-border";
import { Dock } from "@/components/reactomega/dock";
import { Marquee } from "@/components/reactomega/marquee";
import { SpringMesh } from "@/components/reactomega/spring-mesh";
import { Cloth } from "@/components/reactomega/cloth";
import { Metaballs } from "@/components/reactomega/metaballs";
import { Rope } from "@/components/reactomega/rope";
import { PendulumWave } from "@/components/reactomega/pendulum-wave";
import { NewtonsCradle } from "@/components/reactomega/newtons-cradle";
import { WaterRipple } from "@/components/reactomega/water-ripple";
import { GravityWells } from "@/components/reactomega/gravity-wells";
import { MagneticField } from "@/components/reactomega/magnetic-field";
import { SoftBody } from "@/components/reactomega/soft-body";
import { PluckedString } from "@/components/reactomega/plucked-string";
import { FallingSand } from "@/components/reactomega/falling-sand";

export type Category = "text" | "interaction" | "components" | "physics";

export interface Demo {
  name: string;
  title: string;
  category: Category;
  node: ReactNode;
  fill?: boolean; // demo fills the frame (canvas/physics)
}

const center = "flex h-full w-full items-center justify-center p-4 text-center";

/** Remounts its children on an interval so one-shot (reveal/count) demos keep replaying in the gallery. */
function Loop({ ms = 3800, children }: { ms?: number; children: ReactNode }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setK((v) => v + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
  return (
    <div key={k} className="contents">
      {children}
    </div>
  );
}

export const DEMOS: Demo[] = [
  // ---- text ----
  { name: "split-text", title: "Split Text", category: "text", node: <Loop><div className={center}><SplitText text="Build something memorable." by="chars" stagger={0.03} startOnView={false} className="text-2xl font-semibold" /></div></Loop> },
  { name: "shiny-text", title: "Shiny Text", category: "text", node: <div className={center}><ShinyText text="Shiny by default" speed={2.6} className="text-2xl font-semibold" /></div> },
  { name: "gradient-text", title: "Gradient Text", category: "text", node: <div className={center}><GradientText className="text-2xl font-bold">Gradient flows through</GradientText></div> },
  { name: "count-up", title: "Count Up", category: "text", node: <Loop ms={4200}><div className={center}><CountUp to={12480} prefix="$" startOnView={false} className="text-4xl font-bold text-violet-300" /></div></Loop> },
  { name: "variable-proximity", title: "Variable Proximity", category: "text", node: <div className={center}><VariableProximity text="Hover the letters" className="text-4xl font-bold" radius={150} fromFontVariationSettings="'wght' 250" toFontVariationSettings="'wght' 900" /></div> },
  { name: "magnetic-text", title: "Magnetic Text", category: "text", node: <div className={center}><MagneticText text="Magnetic letters" className="text-3xl font-bold" /></div> },
  { name: "gravity-text", title: "Gravity Text", category: "text", node: <div className={center}><GravityText text="Hover: let it fall" trigger="hover" className="text-2xl font-bold" /></div> },
  { name: "elastic-text", title: "Elastic Text", category: "text", node: <div className={center}><ElasticText text="Jelly text" className="text-3xl font-bold" /></div> },
  { name: "scramble-text", title: "Scramble Text", category: "text", node: <div className={center}><ScrambleText text="DECODING..." trigger="hover" className="text-2xl font-bold text-emerald-300" /></div> },
  { name: "text-reveal", title: "Text Reveal", category: "text", node: <div className="flex h-full w-full items-center p-5"><TextReveal text="Each word lights up as this block scrolls through the viewport." className="text-lg font-medium" /></div> },

  // ---- interaction ----
  { name: "magnetic", title: "Magnetic", category: "interaction", node: <div className={center}><Magnetic strength={26}><button className="rounded-full bg-violet-600 px-6 py-3 font-semibold text-white">Magnetic</button></Magnetic></div> },
  { name: "spotlight-card", title: "Spotlight Card", category: "interaction", fill: true, node: <SpotlightCard className="h-full w-full rounded-none border-0"><div className="flex h-full items-center justify-center font-medium text-neutral-300">Move your pointer</div></SpotlightCard> },
  { name: "tilt-card", title: "Tilt Card", category: "interaction", node: <div className={center}><TiltCard className="flex h-32 w-48 items-center justify-center font-medium text-neutral-300">Tilt me</TiltCard></div> },
  { name: "holographic-card", title: "Holographic Card", category: "interaction", node: <div className={center}><HolographicCard className="flex h-32 w-48 items-center justify-center font-semibold text-white">Holo foil</HolographicCard></div> },
  { name: "click-spark", title: "Click Spark", category: "interaction", node: <div className={center}><ClickSpark><button className="rounded-xl border border-white/15 px-6 py-3 font-semibold">Click me</button></ClickSpark></div> },
  { name: "dot-grid", title: "Dot Grid", category: "interaction", fill: true, node: <DotGrid /> },

  // ---- components ----
  { name: "star-border", title: "Star Border", category: "components", node: <div className={center}><StarBorder>Star Border</StarBorder></div> },
  { name: "dock", title: "Dock", category: "components", node: <div className="flex h-full w-full items-end justify-center pb-5">{<Dock>{["✦", "◆", "●", "▲", "■"].map((s, i) => (<div key={i} className="grid h-full w-full place-items-center rounded-xl bg-white/10 text-lg">{s}</div>))}</Dock>}</div> },
  { name: "marquee", title: "Marquee", category: "components", fill: true, node: <div className="flex h-full w-full items-center"><Marquee speed={14}>{["React", "Tailwind", "MCP", "Motion", "Physics", "A11y"].map((t) => (<span key={t} className="mx-3 rounded-full border border-white/10 px-4 py-1.5 text-sm">{t}</span>))}</Marquee></div> },

  // ---- physics ----
  { name: "spring-mesh", title: "Spring Mesh", category: "physics", fill: true, node: <SpringMesh /> },
  { name: "cloth", title: "Cloth", category: "physics", fill: true, node: <Cloth /> },
  { name: "metaballs", title: "Metaballs", category: "physics", fill: true, node: <Metaballs /> },
  { name: "rope", title: "Rope", category: "physics", fill: true, node: <Rope /> },
  { name: "pendulum-wave", title: "Pendulum Wave", category: "physics", fill: true, node: <PendulumWave /> },
  { name: "newtons-cradle", title: "Newton's Cradle", category: "physics", fill: true, node: <NewtonsCradle /> },
  { name: "water-ripple", title: "Water Ripple", category: "physics", fill: true, node: <WaterRipple /> },
  { name: "gravity-wells", title: "Gravity Wells", category: "physics", fill: true, node: <GravityWells /> },
  { name: "magnetic-field", title: "Magnetic Field", category: "physics", fill: true, node: <MagneticField /> },
  { name: "soft-body", title: "Soft Body", category: "physics", fill: true, node: <SoftBody /> },
  { name: "plucked-string", title: "Plucked String", category: "physics", fill: true, node: <PluckedString /> },
  { name: "falling-sand", title: "Falling Sand", category: "physics", fill: true, node: <FallingSand /> },
];

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "interaction", label: "Interaction" },
  { id: "components", label: "Components" },
  { id: "physics", label: "Physics & Art" },
];
