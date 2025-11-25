'use client';

import { TypewriterEffect } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function TypewriterEffectPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Typewriter Effect</h1>
                <p className="text-xl text-white/60">
                    Text that types itself out character by character with a blinking cursor.
                </p>
            </div>

            <ComponentPreview
                component={TypewriterEffectDemo}
                defaultProps={{
                    text: 'Hello, World! Welcome to ReactΩ.',
                    speed: 50,
                    showCursor: true,
                }}
                propsConfig={[
                    {
                        name: 'text',
                        type: 'string',
                        default: 'Hello, World! Welcome to ReactΩ.',
                        description: 'Text to type',
                    },
                    {
                        name: 'speed',
                        type: 'range',
                        default: 50,
                        min: 10,
                        max: 200,
                        step: 10,
                        description: 'Typing speed (ms)',
                    },
                    {
                        name: 'showCursor',
                        type: 'boolean',
                        default: true,
                        description: 'Show blinking cursor',
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
                    reactCode={`import { TypewriterEffect } from '@reactomega/ui';

export default function App() {
  return (
    <TypewriterEffect 
      text="Hello, World!" 
      speed={50}
      showCursor={true}
    />
  );
}`}
                    jsCode={`<span id="typewriter"></span><span class="cursor">|</span>

<script>
const element = document.getElementById('typewriter');
const text = "Hello, World!";
let i = 0;

function type() {
  if (i < text.length) {
    element.innerHTML += text.charAt(i);
    i++;
    setTimeout(type, 50);
  }
}

type();
</script>`}
                    cssCode={`.cursor {
  display: inline-block;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}`}
                />
            </div>
        </div>
    );
}

function TypewriterEffectDemo(props: any) {
    return (
        <div className="flex items-center justify-center h-full">
            <TypewriterEffect {...props} className="text-2xl text-white" />
        </div>
    );
}
