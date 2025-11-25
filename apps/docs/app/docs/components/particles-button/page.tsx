import { ParticlesButton } from '@reactomega/ui';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function ParticlesButtonPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">ParticlesButton</h1>
            <p className="text-lg text-white/80 mb-8">
                A button that emits particles when clicked.
            </p>

            <div className="relative h-[200px] w-full flex items-center justify-center rounded-xl border border-white/10 bg-black/50">
                <ParticlesButton color="#8b5cf6">Click Me</ParticlesButton>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Usage</h2>
                <CodeTabs
                    reactCode={`import { ParticlesButton } from '@reactomega/ui';

export default function App() {
  return (
    <ParticlesButton color="#8b5cf6">
      Click Me
    </ParticlesButton>
  );
}`}
                    jsCode={`<button class="particles-button">Click Me</button>

<script>
const btn = document.querySelector('.particles-button');
btn.addEventListener('click', (e) => {
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  for(let i=0; i<12; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    btn.appendChild(particle);
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 50 + 20;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    particle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: \`translate(\${tx}px, \${ty}px) scale(0)\`, opacity: 0 }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0, .9, .57, 1)',
    }).onfinish = () => particle.remove();
  }
});
</script>`}
                    cssCode={`.particles-button {
  position: relative;
  padding: 12px 24px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  pointer-events: none;
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
                                <td className="py-2 px-4 text-white/80">Color of the particles</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">particleCount</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">12</td>
                                <td className="py-2 px-4 text-white/80">Number of particles to emit</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
