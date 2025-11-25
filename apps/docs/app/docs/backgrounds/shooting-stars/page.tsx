'use client';

import { ShootingStars } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function ShootingStarsPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Shooting Stars</h1>
                <p className="text-xl text-white/60">
                    Random shooting stars effect with customizable trails.
                </p>
            </div>

            <ComponentPreview
                component={ShootingStars}
                defaultProps={{
                    starColor: '#ffffff',
                    minSpeed: 10,
                    maxSpeed: 30,
                    minDelay: 1000,
                    maxDelay: 3000,
                }}
                propsConfig={[
                    {
                        name: 'starColor',
                        type: 'color',
                        default: '#ffffff',
                        description: 'Color of the stars',
                    },
                    {
                        name: 'minSpeed',
                        type: 'range',
                        default: 10,
                        min: 5,
                        max: 50,
                        step: 1,
                        description: 'Minimum speed',
                    },
                    {
                        name: 'maxSpeed',
                        type: 'range',
                        default: 30,
                        min: 10,
                        max: 100,
                        step: 1,
                        description: 'Maximum speed',
                    },
                    {
                        name: 'minDelay',
                        type: 'range',
                        default: 1000,
                        min: 100,
                        max: 5000,
                        step: 100,
                        description: 'Minimum delay (ms)',
                    },
                    {
                        name: 'maxDelay',
                        type: 'range',
                        default: 3000,
                        min: 500,
                        max: 10000,
                        step: 100,
                        description: 'Maximum delay (ms)',
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
                    reactCode={`import { ShootingStars } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black">
      <ShootingStars minDelay={1000} maxDelay={3000} />
    </div>
  );
}`}
                    jsCode={`const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

class ShootingStar {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = 0;
    this.len = Math.random() * 80 + 10;
    this.speed = Math.random() * 10 + 6;
  }
  
  draw() {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.len, this.y + this.len);
    ctx.stroke();
  }
  
  update() {
    this.x += this.speed;
    this.y += this.speed;
    if (this.x > canvas.width || this.y > canvas.height) {
      this.reset();
    }
  }
}

const stars = [new ShootingStar(), new ShootingStar()];

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(star => {
    star.update();
    star.draw();
  });
  requestAnimationFrame(animate);
}
animate();`}
                    cssCode={`#stars {
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
