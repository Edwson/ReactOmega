import { TiltedCard } from '@reactomega/ui';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function TiltedCardPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">TiltedCard</h1>
            <p className="text-lg text-white/80 mb-8">
                A card component that tilts in 3D space based on mouse position.
            </p>

            <div className="relative h-[400px] w-full flex items-center justify-center rounded-xl border border-white/10 bg-black/50">
                <TiltedCard className="w-64 h-80 flex flex-col items-center justify-center gap-4 bg-gray-900/80 backdrop-blur-sm">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-2xl">🚀</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Hover Me</h3>
                    <p className="text-white/60 text-center text-sm">
                        Move your mouse around to see the 3D tilt effect.
                    </p>
                </TiltedCard>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Usage</h2>
                <CodeTabs
                    reactCode={`import { TiltedCard } from '@reactomega/ui';

export default function App() {
  return (
    <TiltedCard className="w-64 h-80 p-6 bg-gray-900">
      <h3 className="text-xl font-bold">Content</h3>
    </TiltedCard>
  );
}`}
                    jsCode={`<div class="tilted-card">
  <div class="tilted-content">
    <h3>3D Tilt</h3>
  </div>
</div>

<script>
const card = document.querySelector('.tilted-card');
const content = document.querySelector('.tilted-content');

card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = ((y - centerY) / centerY) * -20;
  const rotateY = ((x - centerX) / centerX) * 20;
  
  content.style.transform = \`rotateX(\${rotateX}deg) rotateY(\${rotateY}deg)\`;
});

card.addEventListener('mouseleave', () => {
  content.style.transform = 'rotateX(0) rotateY(0)';
});
</script>`}
                    cssCode={`.tilted-card {
  width: 300px;
  height: 400px;
  perspective: 1000px;
}

.tilted-content {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  border-radius: 16px;
  padding: 24px;
  color: white;
  transition: transform 0.1s;
  transform-style: preserve-3d;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
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
                                <td className="py-2 px-4 font-mono text-purple-400">maxTilt</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">20</td>
                                <td className="py-2 px-4 text-white/80">Maximum tilt angle in degrees</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
