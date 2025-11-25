'use client';

import { WarpSpeed } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function WarpSpeedPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Warp Speed</h1>
                <p className="text-xl text-white/60">
                    Star Wars-style hyperspace jump effect with radial motion blur.
                </p>
            </div>

            <ComponentPreview
                component={WarpSpeed}
                defaultProps={{
                    count: 200,
                    speed: 10,
                    color: '#ffffff',
                }}
                propsConfig={[
                    {
                        name: 'count',
                        type: 'number',
                        default: 200,
                        description: 'Number of stars',
                    },
                    {
                        name: 'speed',
                        type: 'range',
                        default: 10,
                        min: 1,
                        max: 30,
                        step: 1,
                        description: 'Warp speed',
                    },
                    {
                        name: 'color',
                        type: 'color',
                        default: '#ffffff',
                        description: 'Star color',
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
                    reactCode={`import { WarpSpeed } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen">
      <WarpSpeed count={200} speed={10} />
    </div>
  );
}`}
                    jsCode={`const canvas = document.getElementById('warp-canvas');
const ctx = canvas.getContext('2d');

let stars = [];
const speed = 10;

function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width
    });
  }
}

function animate() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  stars.forEach(star => {
    star.z -= speed;
    if (star.z <= 0) {
      star.z = canvas.width;
      star.x = Math.random() * canvas.width;
      star.y = Math.random() * canvas.height;
    }
    
    const x = (star.x - canvas.width / 2) * (canvas.width / star.z) + canvas.width / 2;
    const y = (star.y - canvas.height / 2) * (canvas.width / star.z) + canvas.height / 2;
    const size = (canvas.width / star.z);
    
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, size, size);
  });
  
  requestAnimationFrame(animate);
}

init();
animate();`}
                    cssCode={`#warp-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}`}
                />
            </div>
        </div>
    );
}
