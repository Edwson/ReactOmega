import { MagneticIcon } from '@reactomega/ui';
import { CodeTabs } from '@/components/ui/CodeTabs';
import { Icon } from 'lucide-react';

export default function MagneticIconPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">MagneticIcon</h1>
            <p className="text-lg text-white/80 mb-8">
                An icon wrapper that sticks to the cursor magnetically.
            </p>

            <div className="relative h-[200px] w-full flex items-center justify-center rounded-xl border border-white/10 bg-black/50">
                <MagneticIcon className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M12 2v20M2 12h20" />
                    </svg>
                </MagneticIcon>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Usage</h2>
                <CodeTabs
                    reactCode={`import { MagneticIcon } from '@reactomega/ui';
import { Icon } from 'lucide-react';

export default function App() {
  return (
    <MagneticIcon strength={0.5}>
      <Icon />
    </MagneticIcon>
  );
}`}
                    jsCode={`<div class="magnetic-icon">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
</div>

<script>
const icon = document.querySelector('.magnetic-icon');
icon.addEventListener('mousemove', (e) => {
  const rect = icon.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  
  icon.style.transform = \`translate(\${x * 0.5}px, \${y * 0.5}px)\`;
});

icon.addEventListener('mouseleave', () => {
  icon.style.transform = 'translate(0, 0)';
});
</script>`}
                    cssCode={`.magnetic-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  color: white;
  transition: transform 0.1s;
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
                                <td className="py-2 px-4 font-mono text-purple-400">strength</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">0.5</td>
                                <td className="py-2 px-4 text-white/80">Strength of the magnetic effect</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
