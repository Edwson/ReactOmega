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
import { LiquidMetal } from "@/components/reactomega/liquid-metal";
import { ThinFilm } from "@/components/reactomega/thin-film";
import { Caustics } from "@/components/reactomega/caustics";
import { HalftoneGradient } from "@/components/reactomega/halftone-gradient";
import { VolumetricRays } from "@/components/reactomega/volumetric-rays";
import { CurlFlow } from "@/components/reactomega/curl-flow";
import { InertiaCursor } from "@/components/reactomega/inertia-cursor";
import { ElasticCursor } from "@/components/reactomega/elastic-cursor";
import { ImageTrail } from "@/components/reactomega/image-trail";
import { PixelTrail } from "@/components/reactomega/pixel-trail";
import { Crosshair } from "@/components/reactomega/crosshair";
import { ScrollStack } from "@/components/reactomega/scroll-stack";
import { ScrollVelocity } from "@/components/reactomega/scroll-velocity";
import { ParallaxLayers, ParallaxLayer } from "@/components/reactomega/parallax-layers";
import { ScrollScene } from "@/components/reactomega/scroll-scene";
import { CardSwap } from "@/components/reactomega/card-swap";
import { GooeyNav } from "@/components/reactomega/gooey-nav";
import { BentoGrid, BentoTile } from "@/components/reactomega/bento-grid";
import { ElasticSlider } from "@/components/reactomega/elastic-slider";
import { CircularGallery } from "@/components/reactomega/circular-gallery";

export type Category = "text" | "interaction" | "cursor" | "scroll" | "shader" | "physics" | "components";

export interface Demo {
  name: string;
  title: string;
  category: Category;
  node: ReactNode;
  fill?: boolean; // demo fills the frame (canvas/physics)
  tall?: boolean; // needs real page height to demo (scroll-driven) — rendered full-width
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

/**
 * Mounts its children only while the pointer is over the card. The cursor
 * components are deliberately global (fixed, full-viewport) — three of them
 * mounted at once in a gallery would fight over the same pointer, so each one
 * takes over only while you are actually looking at it.
 */
function HoverMount({ label, children }: { label: string; children: ReactNode }) {
  const [on, setOn] = useState(false);
  return (
    <div
      className="relative h-full w-full"
      onPointerEnter={() => setOn(true)}
      onPointerLeave={() => setOn(false)}
    >
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-neutral-500">{label}</div>
      {on ? children : null}
    </div>
  );
}

/** Inline SVG placeholder art — keeps the playground free of external image requests. */
const shot = (hue: number, label: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="hsl(' + hue + ' 82% 64%)"/>' +
      '<stop offset="1" stop-color="hsl(' + (hue + 44) + ' 74% 36%)"/>' +
      "</linearGradient></defs>" +
      '<rect width="400" height="300" fill="url(#g)"/>' +
      '<text x="50%" y="53%" text-anchor="middle" font-family="Inter,system-ui,sans-serif" ' +
      'font-size="40" font-weight="800" fill="rgba(255,255,255,.92)">' + label + "</text></svg>",
  );

const SHOTS = [258, 200, 158, 320, 30, 286].map((h, i) => shot(h, String(i + 1)));
const GALLERY = SHOTS.map((src, i) => ({ src, alt: "", label: "Plate " + (i + 1) }));

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

  // ---- shaders (raw WebGL2) ----
  { name: "liquid-metal", title: "Liquid Metal", category: "shader", fill: true, node: <LiquidMetal /> },
  { name: "thin-film", title: "Thin Film", category: "shader", fill: true, node: <ThinFilm /> },
  { name: "caustics", title: "Caustics", category: "shader", fill: true, node: <Caustics /> },
  { name: "halftone-gradient", title: "Halftone Gradient", category: "shader", fill: true, node: <HalftoneGradient /> },
  { name: "volumetric-rays", title: "Volumetric Rays", category: "shader", fill: true, node: <VolumetricRays /> },
  { name: "curl-flow", title: "Curl Flow", category: "shader", fill: true, node: <CurlFlow /> },

  // ---- cursor & pointer ----
  { name: "inertia-cursor", title: "Inertia Cursor", category: "cursor", fill: true, node: <HoverMount label="Hover — the cursor takes over"><InertiaCursor /></HoverMount> },
  { name: "elastic-cursor", title: "Elastic Cursor", category: "cursor", fill: true, node: <HoverMount label="Hover — flick it around"><ElasticCursor /></HoverMount> },
  { name: "image-trail", title: "Image Trail", category: "cursor", fill: true, node: <ImageTrail images={SHOTS} className="h-full w-full" width={120}><div className={center}><span className="text-sm text-neutral-500">Move across the card</span></div></ImageTrail> },
  { name: "pixel-trail", title: "Pixel Trail", category: "cursor", fill: true, node: <PixelTrail /> },
  { name: "crosshair", title: "Crosshair", category: "cursor", fill: true, node: <Crosshair className="h-full w-full"><div className="grid h-full w-full grid-cols-2 place-items-center gap-3 p-6">{["ASK", "BID", "MID", "LAST"].map((t) => (<span key={t} data-snap className="rounded-md border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs tracking-widest text-neutral-300">{t}</span>))}</div></Crosshair> },

  // ---- scroll-driven ----
  { name: "scroll-velocity", title: "Scroll Velocity", category: "scroll", fill: true, node: <div className="flex h-full w-full items-center"><ScrollVelocity baseSpeed={30}>{["SCROLL", "FASTER", "IT LURCHES", "THEN SETTLES"].map((t) => (<span key={t} className="mx-4 text-2xl font-black tracking-tight text-neutral-300">{t}</span>))}</ScrollVelocity></div> },
  { name: "parallax-layers", title: "Parallax Layers", category: "scroll", fill: true, node: <ParallaxLayers className="h-full w-full" range={70}><div className="relative h-full w-full"><ParallaxLayer depth={0.15} blur={1.5} className="absolute inset-0 grid place-items-center"><span className="text-6xl font-black text-white/5">BACK</span></ParallaxLayer><ParallaxLayer depth={0.55} className="absolute inset-0 grid place-items-center"><span className="text-3xl font-black text-violet-400/40">MIDDLE</span></ParallaxLayer><ParallaxLayer depth={1} className="absolute inset-0 grid place-items-center"><span className="text-xl font-bold text-white">FRONT</span></ParallaxLayer></div></ParallaxLayers> },
  { name: "scroll-stack", title: "Scroll Stack", category: "scroll", tall: true, node: <ScrollStack offset={110}>{[["Regulation", "Read it before opening Figma."], ["Risk", "The default must be the safe one."], ["Evidence", "Every number carries its source."], ["Scale", "Built once, applied everywhere."]].map(([h, p], i) => (<div key={h} className="rounded-2xl border border-white/10 bg-neutral-900 p-10 shadow-2xl"><div className="font-mono text-xs text-violet-400">0{i + 1}</div><h3 className="mt-3 text-3xl font-bold">{h}</h3><p className="mt-2 max-w-md text-neutral-400">{p}</p></div>))}</ScrollStack> },
  { name: "scroll-scene", title: "Scroll Scene", category: "scroll", tall: true, node: <ScrollScene length={1.4}>{(p) => (<div className="grid h-full w-full place-items-center"><div className="text-center"><div className="font-mono text-xs tracking-[0.3em] text-violet-400">PROGRESS {(p * 100).toFixed(0)}%</div><div className="mt-4 text-5xl font-black tracking-tight" style={{ transform: `scale(${0.7 + p * 0.5})`, opacity: 0.25 + p * 0.75 }}>Scrubbed by scroll</div><div className="mx-auto mt-6 h-1 w-64 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-violet-500" style={{ width: `${p * 100}%` }} /></div></div></div>)}</ScrollScene> },

  // ---- components (new) ----
  { name: "card-swap", title: "Card Swap", category: "components", fill: true, node: <div className="grid h-full w-full place-items-center"><CardSwap className="w-56" minHeight={150} interval={2600} offset={16} depth={40}>{[["Ω", "ReactOmega"], ["◆", "Own the code"], ["✦", "AI-native"]].map(([g, t]) => (<div key={t} className="flex h-full w-full flex-col justify-between"><span className="text-2xl">{g}</span><span className="text-sm font-semibold text-neutral-200">{t}</span></div>))}</CardSwap></div> },
  { name: "gooey-nav", title: "Gooey Nav", category: "components", node: <div className={center}><GooeyNav items={[{ id: "a", label: "Motion" }, { id: "b", label: "Physics" }, { id: "c", label: "Shaders" }]} /></div> },
  { name: "bento-grid", title: "Bento Grid", category: "components", fill: true, node: <BentoGrid className="h-full w-full p-3" columns={3} gap={8} rowHeight={86}><BentoTile colSpan={2} className="grid place-items-center text-sm font-semibold text-neutral-200">Spotlight follows you</BentoTile><BentoTile className="grid place-items-center text-xs text-neutral-400">Tilt</BentoTile><BentoTile className="grid place-items-center text-xs text-neutral-400">Glow</BentoTile><BentoTile colSpan={2} className="grid place-items-center text-xs text-neutral-400">One listener for the whole grid</BentoTile></BentoGrid> },
  { name: "elastic-slider", title: "Elastic Slider", category: "components", node: <div className="flex h-full w-full items-center px-8"><ElasticSlider defaultValue={62} leftIcon={<span className="text-xs text-neutral-500">min</span>} rightIcon={<span className="text-xs text-neutral-500">max</span>} /></div> },
  { name: "circular-gallery", title: "Circular Gallery", category: "components", fill: true, node: <CircularGallery items={GALLERY} radius={190} itemWidth={88} className="h-full w-full" /> },
];

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "interaction", label: "Interaction" },
  { id: "cursor", label: "Cursor & Pointer" },
  { id: "scroll", label: "Scroll-Driven" },
  { id: "shader", label: "Shaders & Light" },
  { id: "physics", label: "Physics & Art" },
  { id: "components", label: "Components" },
];
