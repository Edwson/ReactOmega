'use client';

import { StarBorder } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function StarBorderPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Star Border</h1>
                <p className="text-xl text-white/60">
                    Animated gradient border effect resembling a shooting star.
                </p>
            </div>

            <ComponentPreview
                component={StarBorderDemo}
                defaultProps={{
                    color: '#ffffff',
                    speed: 4,
                }}
                propsConfig={[
                    {
                        name: 'color',
                        type: 'color',
                        default: '#ffffff',
                        description: 'Color of the border',
                    },
                    {
                        name: 'speed',
                        type: 'range',
                        default: 4,
                        min: 1,
                        max: 10,
                        step: 0.5,
                        description: 'Animation duration (seconds)',
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
                    reactCode={`import { StarBorder } from '@reactomega/ui';

export default function App() {
  return (
    <StarBorder className="p-4" color="#ffffff">
      <button className="text-white">Click Me</button>
    </StarBorder>
  );
}`}
                    jsCode={`<div class="star-border">
  <button>Click Me</button>
</div>`}
                    cssCode={`.star-border {
  position: relative;
  display: inline-block;
  padding: 1px;
  border-radius: 8px;
  background: #000;
  overflow: hidden;
}

.star-border::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 270deg,
    white 360deg
  );
  animation: rotate 4s linear infinite;
}

.star-border > * {
  position: relative;
  background: #000;
  border-radius: 7px;
  z-index: 1;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`}
                />
            </div>
        </div>
    );
}

function StarBorderDemo(props: any) {
    return (
        <div className="flex items-center justify-center h-full">
            <StarBorder {...props} className="p-1 rounded-2xl">
                <div className="bg-black/80 backdrop-blur-xl px-8 py-4 rounded-xl text-white font-bold">
                    Cosmic Button
                </div>
            </StarBorder>
        </div>
    );
}
