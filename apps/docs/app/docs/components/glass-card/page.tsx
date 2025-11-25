'use client';

import { GlassCard } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function GlassCardPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Glass Card</h1>
                <p className="text-xl text-white/60">
                    Highly realistic glassmorphism card with backdrop blur.
                </p>
            </div>

            <ComponentPreview
                component={GlassCardDemo}
                defaultProps={{
                    blur: 'md',
                }}
                propsConfig={[
                    {
                        name: 'blur',
                        type: 'select',
                        default: 'md',
                        options: [
                            { label: 'Small', value: 'sm' },
                            { label: 'Medium', value: 'md' },
                            { label: 'Large', value: 'lg' },
                        ],
                        description: 'Blur intensity',
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
                    reactCode={`import { GlassCard } from '@reactomega/ui';

export default function App() {
  return (
    <GlassCard blur="md">
      <h3 className="text-xl font-bold">Glass Effect</h3>
      <p className="text-white/60">Beautiful glassmorphism design.</p>
    </GlassCard>
  );
}`}
                    jsCode={`<div class="glass-card">
  <h3>Glass Effect</h3>
  <p>Beautiful glassmorphism design.</p>
</div>`}
                    cssCode={`.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  color: white;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.glass-card h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: bold;
}

.glass-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
}`}
                />
            </div>
        </div>
    );
}

function GlassCardDemo(props: any) {
    return (
        <div className="flex items-center justify-center p-10 bg-gradient-to-br from-purple-500 to-blue-500">
            <GlassCard {...props} className="max-w-md">
                <h3 className="text-2xl font-bold text-white mb-2">Glassmorphism</h3>
                <p className="text-white/80">
                    A modern design trend featuring frosted glass aesthetics with blur and transparency.
                </p>
            </GlassCard>
        </div>
    );
}
