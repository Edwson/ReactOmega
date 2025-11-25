'use client';

import { Particles } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function ParticlesPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Particles</h1>
                <p className="text-xl text-white/60">
                    Interactive particle system with connecting lines that react to mouse proximity.
                </p>
            </div>

            <ComponentPreview
                component={Particles}
                defaultProps={{
                    count: 100,
                    color: '#ffffff',
                    lineColor: '#ffffff',
                    maxDistance: 150,
                    speed: 0.5,
                }}
                propsConfig={[
                    {
                        name: 'count',
                        type: 'number',
                        default: 100,
                        description: 'Number of particles',
                    },
                    {
                        name: 'color',
                        type: 'color',
                        default: '#ffffff',
                        description: 'Particle color',
                    },
                    {
                        name: 'lineColor',
                        type: 'color',
                        default: '#ffffff',
                        description: 'Connection line color',
                    },
                    {
                        name: 'maxDistance',
                        type: 'range',
                        default: 150,
                        min: 50,
                        max: 300,
                        step: 10,
                        description: 'Max connection distance',
                    },
                    {
                        name: 'speed',
                        type: 'range',
                        default: 0.5,
                        min: 0.1,
                        max: 2,
                        step: 0.1,
                        description: 'Particle speed',
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
                    reactCode={`import { Particles } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen">
      <Particles count={100} color="#ffffff" />
    </div>
  );
}`}
                    jsCode={`const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const connectDistance = 150;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = Math.random() * 2 - 1;
    this.vy = Math.random() * 2 - 1;
    this.size = 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 100; i++) particles.push(new Particle());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach((p, index) => {
    p.update();
    p.draw();
    
    for (let j = index + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < connectDistance) {
        ctx.strokeStyle = \`rgba(255, 255, 255, \${1 - dist / connectDistance})\`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  });
  
  requestAnimationFrame(animate);
}
animate();`}
                    cssCode={`#particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
}`}
                />
            </div>
        </div>
    );
}
