'use client';

import { MagneticButton } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function MagneticButtonPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Magnetic Button</h1>
                <p className="text-xl text-white/60">
                    Button that magnetically attracts the cursor when hovering.
                </p>
            </div>

            <ComponentPreview
                component={MagneticButtonDemo}
                defaultProps={{
                    strength: 0.5,
                }}
                propsConfig={[
                    {
                        name: 'strength',
                        type: 'range',
                        default: 0.5,
                        min: 0.1,
                        max: 2,
                        step: 0.1,
                        description: 'Magnetic strength',
                    },
                ]}
            />

            <div className="prose prose-invert max-w-none">
                <h2>Installation</h2>
                <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                    <code>npm install @reactomega/ui framer-motion</code>
                </pre>

                <h2>Usage</h2>
                <h2>Usage</h2>
                <CodeTabs
                    reactCode={`import { MagneticButton } from '@reactomega/ui';

export default function App() {
  return (
    <MagneticButton strength={0.5}>
      Hover Me
    </MagneticButton>
  );
}`}
                    jsCode={`<button class="magnetic-btn">Hover Me</button>

<script>
const btn = document.querySelector('.magnetic-btn');
btn.addEventListener('mousemove', (e) => {
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  
  btn.style.transform = \`translate(\${x * 0.5}px, \${y * 0.5}px)\`;
});

btn.addEventListener('mouseleave', () => {
  btn.style.transform = 'translate(0, 0)';
});
</script>`}
                    cssCode={`.magnetic-btn {
  padding: 12px 24px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.1s;
}`}
                />
            </div>
        </div>
    );
}

function MagneticButtonDemo(props: any) {
    return (
        <div className="flex items-center justify-center h-full">
            <MagneticButton {...props}>
                Magnetic
            </MagneticButton>
        </div>
    );
}
