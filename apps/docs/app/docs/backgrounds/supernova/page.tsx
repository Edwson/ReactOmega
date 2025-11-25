'use client';

import { Supernova } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function SupernovaPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Supernova</h1>
        <p className="text-xl text-white/60">Explosive star effect with shockwave rings and energy rays.</p>
      </div>
      <ComponentPreview
        component={Supernova}
        defaultProps={{ color: '#ff6600', intensity: 1, speed: 1 }}
        propsConfig={[
          { name: 'color', type: 'color', default: '#ff6600', description: 'Explosion color' },
          { name: 'intensity', type: 'range', default: 1, min: 0.5, max: 2, step: 0.1, description: 'Intensity' },
          { name: 'speed', type: 'range', default: 1, min: 0.5, max: 3, step: 0.1, description: 'Animation speed' },
        ]}
      />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Usage</h2>
        <CodeTabs
          reactCode={`import { Supernova } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <Supernova color="#ff6600" />
    </div>
  );
}`}
          jsCode={`<canvas id="supernova"></canvas>

<script>
const canvas = document.getElementById('supernova');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const cx = canvas.width / 2;
const cy = canvas.height / 2;

class Particle {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = cx;
    this.y = cy;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.01;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    
    if(this.life <= 0) this.reset();
  }
  
  draw() {
    ctx.fillStyle = \`rgba(255, 102, 0, \${this.life})\`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

for(let i=0; i<100; i++) particles.push(new Particle());

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(p => {
    p.update();
    p.draw();
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
