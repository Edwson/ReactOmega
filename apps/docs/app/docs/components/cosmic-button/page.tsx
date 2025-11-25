'use client';

import { CosmicButton } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function CosmicButtonPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Cosmic Button</h1>
                <p className="text-xl text-white/60">
                    Button with stardust hover effects and cosmic glow.
                </p>
            </div>

            <ComponentPreview
                component={CosmicButtonDemo}
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
                    reactCode={`import { CosmicButton } from '@reactomega/ui';

export default function App() {
  return (
    <CosmicButton>
      Launch
    </CosmicButton>
  );
}`}
                    jsCode={`<button class="cosmic-button">Launch</button>`}
                    cssCode={`.cosmic-button {
  background: linear-gradient(45deg, #8b5cf6, #3b82f6);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  cursor: pointer;
  transition: all 0.3s;
}

.cosmic-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.8);
}`}
                />
            </div>
        </div>
    );
}

function CosmicButtonDemo() {
    return (
        <div className="flex items-center justify-center h-full gap-4">
            <CosmicButton>
                Launch Mission
            </CosmicButton>
            <CosmicButton className="bg-white text-black hover:bg-white/90">
                Abort
            </CosmicButton>
        </div>
    );
}
