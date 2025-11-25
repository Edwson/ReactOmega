'use client';

import { Starfield } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function StarfieldPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Starfield</h1>
                <p className="text-xl text-white/60">
                    A classic twinkling starfield background.
                </p>
            </div>

            <ComponentPreview
                component={Starfield}
                defaultProps={{
                    speed: 1,
                    starCount: 500,
                    starColor: '#ffffff',
                    backgroundColor: 'transparent',
                }}
                propsConfig={[
                    {
                        name: 'speed',
                        type: 'range',
                        default: 1,
                        min: 0.1,
                        max: 5,
                        step: 0.1,
                        description: 'Animation speed multiplier',
                    },
                    {
                        name: 'starCount',
                        type: 'range',
                        default: 500,
                        min: 100,
                        max: 2000,
                        step: 100,
                        description: 'Number of stars in the field',
                    },
                    {
                        name: 'starColor',
                        type: 'color',
                        default: '#ffffff',
                        description: 'Color of the stars',
                    },
                    {
                        name: 'backgroundColor',
                        type: 'color',
                        default: 'transparent',
                        description: 'Background color',
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
                    reactCode={`import { Starfield } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black">
      <Starfield speed={1} starCount={500} />
    </div>
  );
}`}
                    jsCode={`const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
for(let i=0; i<500; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2,
    opacity: Math.random(),
    speed: Math.random() * 0.05 + 0.01
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  stars.forEach(star => {
    star.opacity += star.speed;
    if(star.opacity > 1 || star.opacity < 0) star.speed *= -1;
    
    ctx.fillStyle = \`rgba(255, 255, 255, \${star.opacity})\`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  
  requestAnimationFrame(animate);
}
animate();`}
                    cssCode={`#starfield {
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
