'use client';

import { CosmicDust } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function CosmicDustPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Cosmic Dust</h1>
                <p className="text-xl text-white/60">
                    Floating particles creating a subtle atmospheric effect.
                </p>
            </div>

            <ComponentPreview
                component={CosmicDust}
                defaultProps={{
                    particleCount: 100,
                    particleColor: '#ffffff',
                    speed: 1,
                }}
                propsConfig={[
                    {
                        name: 'particleCount',
                        type: 'range',
                        default: 100,
                        min: 50,
                        max: 500,
                        step: 50,
                        description: 'Number of particles',
                    },
                    {
                        name: 'particleColor',
                        type: 'color',
                        default: '#ffffff',
                        description: 'Color of the particles',
                    },
                    {
                        name: 'speed',
                        type: 'range',
                        default: 1,
                        min: 0.1,
                        max: 5,
                        step: 0.1,
                        description: 'Animation speed multiplier',
                    },
                ]}
            />

            <div className="prose prose-invert max-w-none">
                <h2>Installation</h2>
                <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                    <code>npm install @reactomega/ui</code>
                </pre>

                <h2>Usage</h2>
                <CodeTabs
                    reactCode={`import { CosmicDust } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black">
      <CosmicDust particleCount={100} />
    </div>
  );
}`}
                    jsCode={`const canvas = document.getElementById('dust');
const ctx = canvas.getContext('2d');

const particles = [];
for(let i=0; i<100; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: Math.random() * 0.5 - 0.25,
    vy: Math.random() * 0.5 - 0.25,
    size: Math.random() * 2
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    
    if(p.x < 0) p.x = canvas.width;
    if(p.x > canvas.width) p.x = 0;
    if(p.y < 0) p.y = canvas.height;
    if(p.y > canvas.height) p.y = 0;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  
  requestAnimationFrame(animate);
}
animate();`}
                    cssCode={`#dust {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}`}
                />
            </div>
        </div>
    );
}
