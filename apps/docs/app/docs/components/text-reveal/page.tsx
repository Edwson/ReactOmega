'use client';

import { TextReveal } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function TextRevealPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Text Reveal</h1>
                <p className="text-xl text-white/60">
                    Text that reveals itself with a decoding/scramble effect.
                </p>
            </div>

            <ComponentPreview
                component={TextRevealDemo}
                defaultProps={{
                    text: 'SYSTEM INITIALIZED',
                    speed: 50,
                }}
                propsConfig={[
                    {
                        name: 'text',
                        type: 'string',
                        default: 'SYSTEM INITIALIZED',
                        description: 'Text to reveal',
                    },
                    {
                        name: 'speed',
                        type: 'range',
                        default: 50,
                        min: 10,
                        max: 200,
                        step: 10,
                        description: 'Reveal speed (ms)',
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
                    reactCode={`import { TextReveal } from '@reactomega/ui';

export default function App() {
  return (
    <TextReveal text="Hello World" className="text-2xl" />
  );
}`}
                    jsCode={`<div id="reveal-text" class="text-reveal"></div>

<script>
const element = document.getElementById('reveal-text');
const final = "SYSTEM INITIALIZED";
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
let iterations = 0;

const interval = setInterval(() => {
  element.innerText = final.split('')
    .map((letter, index) => {
      if(index < iterations) return final[index];
      return chars[Math.floor(Math.random() * chars.length)];
    })
    .join('');
    
  if(iterations >= final.length) clearInterval(interval);
  iterations += 1/3;
}, 30);
</script>`}
                    cssCode={`.text-reveal {
  font-family: monospace;
  font-size: 24px;
  font-weight: bold;
  color: #00ff88;
}`}
                />
            </div>
        </div>
    );
}

function TextRevealDemo(props: any) {
    return (
        <div className="flex items-center justify-center h-full">
            <TextReveal {...props} className="text-4xl font-bold text-white" />
        </div>
    );
}
