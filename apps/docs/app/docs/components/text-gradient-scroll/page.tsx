import { TextGradientScroll } from '@reactomega/ui';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function TextGradientScrollPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">TextGradientScroll</h1>
            <p className="text-lg text-white/80 mb-8">
                A text component that reveals a gradient based on scroll position.
            </p>

            <div className="relative h-[400px] w-full overflow-y-auto rounded-xl border border-white/10 bg-black/50 p-8">
                <div className="h-[200px] flex items-center justify-center text-white/50">
                    Scroll down...
                </div>
                <TextGradientScroll text="Scroll to see the magic" startColor="#ff0080" endColor="#7928ca" />
                <div className="h-[200px] flex items-center justify-center text-white/50">
                    Keep scrolling...
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Usage</h2>
                <CodeTabs
                    reactCode={`import { TextGradientScroll } from '@reactomega/ui';

export default function App() {
  return (
    <TextGradientScroll 
      text="Fade In Text" 
      startColor="#ff0080" 
      endColor="#7928ca" 
    />
  );
}`}
                    jsCode={`<h1 class="gradient-scroll-text">Scroll to see the magic</h1>

<script>
const text = document.querySelector('.gradient-scroll-text');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const max = document.body.scrollHeight - window.innerHeight;
  const percentage = Math.min(Math.max(scrolled / (max * 0.5), 0), 1);
  
  text.style.backgroundImage = \`linear-gradient(
    to right, 
    #ff0080 \${percentage * 100}%, 
    #7928ca \${percentage * 100 + 20}%
  )\`;
});
</script>`}
                    cssCode={`.gradient-scroll-text {
  font-size: 4rem;
  font-weight: bold;
  background-image: linear-gradient(to right, #ff0080 0%, #7928ca 20%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  transition: background-image 0.1s;
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
                                <td className="py-2 px-4 font-mono text-purple-400">text</td>
                                <td className="py-2 px-4 font-mono text-white/60">string</td>
                                <td className="py-2 px-4 font-mono text-white/60">-</td>
                                <td className="py-2 px-4 text-white/80">Text content</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">startColor</td>
                                <td className="py-2 px-4 font-mono text-white/60">string</td>
                                <td className="py-2 px-4 font-mono text-white/60">"#ffffff"</td>
                                <td className="py-2 px-4 text-white/80">Start color of the gradient</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">endColor</td>
                                <td className="py-2 px-4 font-mono text-white/60">string</td>
                                <td className="py-2 px-4 font-mono text-white/60">"#666666"</td>
                                <td className="py-2 px-4 text-white/80">End color of the gradient</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
