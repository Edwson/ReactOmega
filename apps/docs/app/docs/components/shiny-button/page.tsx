import { ShinyButton } from '@reactomega/ui';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function ShinyButtonPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">ShinyButton</h1>
            <p className="text-lg text-white/80 mb-8">
                A button with a metallic/shiny sweep effect on hover.
            </p>

            <div className="relative h-[200px] w-full flex items-center justify-center rounded-xl border border-white/10 bg-black/50">
                <ShinyButton color="#8b5cf6">Hover Me</ShinyButton>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Usage</h2>
                <CodeTabs
                    reactCode={`import { ShinyButton } from '@reactomega/ui';

export default function App() {
  return (
    <ShinyButton color="#8b5cf6">
      Hover Me
    </ShinyButton>
  );
}`}
                    jsCode={`<button class="shiny-button">Hover Me</button>`}
                    cssCode={`.shiny-button {
  position: relative;
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.shiny-button:hover {
  transform: translateY(-2px);
}

.shiny-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: skewX(-25deg);
  transition: 0.5s;
}

.shiny-button:hover::before {
  left: 150%;
}`}
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Props</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="py-2 px-4">Prop</th>
                                <th className="py-2 px-4">Type</th>
                                <th className="py-2 px-4">Default</th>
                                <th className="py-2 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">color</td>
                                <td className="py-2 px-4 font-mono text-white/60">string</td>
                                <td className="py-2 px-4 font-mono text-white/60">"#8b5cf6"</td>
                                <td className="py-2 px-4 text-white/80">Background color of the button</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
