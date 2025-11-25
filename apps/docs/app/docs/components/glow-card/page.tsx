'use client';

import { GlowCard } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function GlowCardPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Glow Card</h1>
                <p className="text-xl text-white/60">
                    Interactive card with mouse-following glow effect.
                </p>
            </div>

            <ComponentPreview
                component={GlowCardDemo}
                defaultProps={{
                    glowColor: '#ffffff',
                    size: 300,
                    borderRadius: 16,
                }}
                propsConfig={[
                    {
                        name: 'glowColor',
                        type: 'color',
                        default: '#ffffff',
                        description: 'Color of the glow',
                    },
                    {
                        name: 'size',
                        type: 'range',
                        default: 300,
                        min: 100,
                        max: 600,
                        step: 10,
                        description: 'Size of the glow effect',
                    },
                    {
                        name: 'borderRadius',
                        type: 'range',
                        default: 16,
                        min: 0,
                        max: 32,
                        step: 1,
                        description: 'Border radius',
                    },
                ]}
            />

            <div className="prose prose-invert max-w-none">
                <h2>Installation</h2>
                <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                    <code>npm install @reactomega/ui</code>
                </pre>

                <h2>Usage</h2>
                <h2>Usage</h2>
                <CodeTabs
                    reactCode={`import { GlowCard } from '@reactomega/ui';

export default function App() {
  return (
    <GlowCard className="p-8 text-white">
      <h3 className="text-xl font-bold">Cosmic Card</h3>
      <p className="mt-2 text-white/60">Hover over me to see the glow effect.</p>
    </GlowCard>
  );
}`}
                    jsCode={`<div class="glow-card">
  <div class="glow-content">
    <h3>Glow Card</h3>
    <p>Hover me</p>
  </div>
</div>

<script>
const card = document.querySelector('.glow-card');
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  card.style.setProperty('--mouse-x', \`\${x}px\`);
  card.style.setProperty('--mouse-y', \`\${y}px\`);
});
</script>`}
                    cssCode={`.glow-card {
  position: relative;
  width: 300px;
  background: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
}

.glow-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    600px circle at var(--mouse-x) var(--mouse-y),
    rgba(255, 255, 255, 0.1),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}

.glow-card:hover::before {
  opacity: 1;
}

.glow-content {
  position: relative;
  padding: 24px;
  color: white;
  z-index: 1;
}`}
                />
            </div>
        </div>
    );
}

function GlowCardDemo(props: any) {
    return (
        <div className="flex items-center justify-center h-full p-8">
            <GlowCard {...props} className="w-full max-w-sm p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Cosmic Card</h3>
                <p className="text-white/60">
                    Hover over this card to see the mouse-following glow effect.
                    The glow follows your cursor movement.
                </p>
            </GlowCard>
        </div>
    );
}
