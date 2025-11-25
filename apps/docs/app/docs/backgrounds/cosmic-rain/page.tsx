'use client';

import { CosmicRain } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function CosmicRainPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Cosmic Rain</h1>
        <p className="text-xl text-white/60">Falling cosmic droplets with gradient trails.</p>
      </div>
      <ComponentPreview
        component={CosmicRain}
        defaultProps={{ count: 50, color: '#00ffff', speed: 1 }}
        propsConfig={[
          { name: 'count', type: 'number', default: 50, description: 'Number of drops' },
          { name: 'color', type: 'color', default: '#00ffff', description: 'Drop color' },
          { name: 'speed', type: 'range', default: 1, min: 0.5, max: 3, step: 0.1, description: 'Fall speed' },
        ]}
      />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Usage</h2>
        <CodeTabs
          reactCode={`import { CosmicRain } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black">
      <CosmicRain count={50} color="#00ffff" />
    </div>
  );
}`}
          jsCode={`<canvas id="rain"></canvas>

<script>
const canvas = document.getElementById('rain');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const drops = [];
const count = 50;

class Drop {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.speed = Math.random() * 5 + 2;
    this.length = Math.random() * 20 + 10;
  }
  
  update() {
    this.y += this.speed;
    if(this.y > canvas.height) {
      this.y = Math.random() * -100;
      this.x = Math.random() * canvas.width;
    }
  }
  
  draw() {
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y - this.length);
    ctx.stroke();
  }
}

for(let i=0; i<count; i++) drops.push(new Drop());

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drops.forEach(drop => {
    drop.update();
    drop.draw();
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
