'use client';

import { NeonButton } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function NeonButtonPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Neon Button</h1>
                <p className="text-xl text-white/60">
                    Cyberpunk-style button with neon glow and pulse animation.
                </p>
            </div>

            <ComponentPreview
                component={NeonButtonDemo}
                defaultProps={{
                    neonColor: '#00ffff',
                }}
                propsConfig={[
                    {
                        name: 'neonColor',
                        type: 'color',
                        default: '#00ffff',
                        description: 'Neon glow color',
                    },
                ]}
            />

            <div className="prose prose-invert max-w-none">
                <h2>Installation</h2>
                <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                    <code>npm install @reactomega/ui</code>
                </pre>

                <h2>Usage</h2>
                <CodeTabs
                    reactCode={`import { NeonButton } from '@reactomega/ui';

export default function App() {
  return (
    <NeonButton neonColor="#00ffff">
      Click Me
    </NeonButton>
  );
}`}
                    jsCode={`<button class="neon-button">Click Me</button>`}
                    cssCode={`.neon-button {
  background: transparent;
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 12px 24px;
  border-radius: 6px;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 0 10px #00ffff, inset 0 0 10px #00ffff;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.neon-button:hover {
  background: #00ffff;
  color: black;
  box-shadow: 0 0 20px #00ffff, inset 0 0 20px #00ffff;
}`}
                />
            </div>
        </div>
    );
}

function NeonButtonDemo(props: any) {
    return (
        <div className="flex items-center justify-center h-full">
            <NeonButton {...props}>
                NEON GLOW
            </NeonButton>
        </div>
    );
}
