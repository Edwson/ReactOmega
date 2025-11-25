'use client';

import { SpotlightCard } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function SpotlightCardPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Spotlight Card</h1>
                <p className="text-xl text-white/60">
                    Card component with a mouse-following spotlight effect.
                </p>
            </div>

            <ComponentPreview
                component={SpotlightCardDemo}
                defaultProps={{
                    spotlightColor: 'rgba(255, 255, 255, 0.1)',
                }}
                propsConfig={[
                    {
                        name: 'spotlightColor',
                        type: 'string',
                        default: 'rgba(255, 255, 255, 0.1)',
                        description: 'Color of the spotlight',
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
                    reactCode={`import { SpotlightCard } from '@reactomega/ui';

export default function App() {
  return (
    <SpotlightCard>
      <h3 className="text-xl font-bold">Spotlight Effect</h3>
      <p className="text-white/60">Hover over this card to see the effect.</p>
    </SpotlightCard>
  );
}`}
                    jsCode={`<div class="spotlight-card">
  <div class="spotlight-content">
    <h3>Spotlight</h3>
    <p>Hover me</p>
  </div>
</div>

<script>
const card = document.querySelector('.spotlight-card');
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  card.style.setProperty('--mouse-x', \`\${x}px\`);
  card.style.setProperty('--mouse-y', \`\${y}px\`);
});
</script>`}
                    cssCode={`.spotlight-card {
  position: relative;
  width: 300px;
  padding: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.spotlight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    800px circle at var(--mouse-x) var(--mouse-y),
    rgba(255, 255, 255, 0.15),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}

.spotlight-card:hover::before {
  opacity: 1;
}

.spotlight-content {
  background: #111;
  border-radius: 14px;
  padding: 24px;
  color: white;
  height: 100%;
}`}
                />
            </div>
        </div>
    );
}

function SpotlightCardDemo(props: any) {
    return (
        <div className="flex items-center justify-center p-10">
            <SpotlightCard {...props} className="max-w-md">
                <h3 className="text-2xl font-bold text-white mb-2">Spotlight Effect</h3>
                <p className="text-white/60">
                    Move your mouse over this card to reveal the spotlight effect. It creates a subtle, premium feel suitable for feature cards or pricing tables.
                </p>
            </SpotlightCard>
        </div>
    );
}
