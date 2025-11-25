'use client';

import { HolographicCard } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function HolographicCardPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Holographic Card</h1>
                <p className="text-xl text-white/60">
                    3D tilt effect with holographic rainbow sheen.
                </p>
            </div>

            <ComponentPreview
                component={HolographicCardDemo}
                defaultProps={{}}
                propsConfig={[]}
            />

            <div className="prose prose-invert max-w-none">
                <h2>Installation</h2>
                <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                    <code>npm install @reactomega/ui</code>
                </pre>

                <h2>Usage</h2>
                <h2>Usage</h2>
                <CodeTabs
                    reactCode={`import { HolographicCard } from '@reactomega/ui';

export default function App() {
  return (
    <HolographicCard className="p-8 text-white">
      <h3>Rare Item</h3>
    </HolographicCard>
  );
}`}
                    jsCode={`<div class="holo-card">
  <div class="holo-content">
    <h3>Rare Item</h3>
  </div>
</div>

<script>
const card = document.querySelector('.holo-card');
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = ((y - centerY) / centerY) * -10;
  const rotateY = ((x - centerX) / centerX) * 10;
  
  card.style.transform = \`perspective(1000px) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg)\`;
  card.style.setProperty('--x', x + 'px');
  card.style.setProperty('--y', y + 'px');
});

card.addEventListener('mouseleave', () => {
  card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
});
</script>`}
                    cssCode={`.holo-card {
  width: 300px;
  height: 400px;
  background: #1a1a1a;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.1s;
}

.holo-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.2) 0%,
    transparent 50%
  );
  pointer-events: none;
  mix-blend-mode: overlay;
}`}
                />
            </div>
        </div>
    );
}

function HolographicCardDemo() {
    return (
        <div className="flex items-center justify-center h-full">
            <HolographicCard className="w-64 h-96">
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Cosmic Rare</h3>
                    <p className="text-white/60 text-sm">
                        Legendary item found in the depths of the nebula.
                    </p>
                </div>
            </HolographicCard>
        </div>
    );
}
