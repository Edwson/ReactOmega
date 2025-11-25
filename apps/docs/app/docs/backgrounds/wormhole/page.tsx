'use client';

import { Wormhole } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function WormholePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Wormhole</h1>
        <p className="text-xl text-white/60">Swirling spacetime distortion with gravitational lensing.</p>
      </div>
      <ComponentPreview
        component={Wormhole}
        defaultProps={{ color: '#9945ff', speed: 1, intensity: 1 }}
        propsConfig={[
          { name: 'color', type: 'color', default: '#9945ff', description: 'Wormhole color' },
          { name: 'speed', type: 'range', default: 1, min: 0.5, max: 3, step: 0.1, description: 'Rotation speed' },
          { name: 'intensity', type: 'range', default: 1, min: 0.5, max: 2, step: 0.1, description: 'Brightness' },
        ]}
      />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Usage</h2>
        <CodeTabs
          reactCode={`import { Wormhole } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <Wormhole color="#9945ff" />
    </div>
  );
}`}
          jsCode={`<canvas id="wormhole"></canvas>

<script>
const canvas = document.getElementById('wormhole');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
const cx = canvas.width / 2;
const cy = canvas.height / 2;

class Star {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.angle = Math.random() * Math.PI * 2;
    this.radius = Math.random() * 300 + 50;
    this.speed = Math.random() * 0.02 + 0.01;
    this.size = Math.random() * 2;
  }
  
  update() {
    this.angle += this.speed;
    this.radius -= 0.5;
    if(this.radius < 0) this.reset();
  }
  
  draw() {
    const x = cx + Math.cos(this.angle) * this.radius;
    const y = cy + Math.sin(this.angle) * this.radius;
    
    ctx.fillStyle = '#9945ff';
    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for(let i=0; i<200; i++) stars.push(new Star());

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  stars.forEach(star => {
    star.update();
    star.draw();
  });
  
  requestAnimationFrame(animate);
}

animate();
</script>`}
        />
      </div>
    </div>
  );
}
