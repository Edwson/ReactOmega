'use client';

import { Meteor } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function MeteorPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Meteor</h1>
        <p className="text-xl text-white/60">Meteor shower with glowing trails and atmospheric entry effects.</p>
      </div>
      <ComponentPreview
        component={Meteor}
        defaultProps={{ count: 10, speed: 1, color: '#ffaa00' }}
        propsConfig={[
          { name: 'count', type: 'number', default: 10, description: 'Number of meteors' },
          { name: 'speed', type: 'range', default: 1, min: 0.5, max: 3, step: 0.1, description: 'Speed' },
          { name: 'color', type: 'color', default: '#ffaa00', description: 'Meteor color' },
        ]}
      />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Usage</h2>
        <CodeTabs
          reactCode={`import { Meteor } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black">
      <Meteor count={10} color="#ffaa00" />
    </div>
  );
}`}
          jsCode={`<canvas id="meteor"></canvas>

<script>
const canvas = document.getElementById('meteor');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const meteors = [];
const count = 10;

class Meteor {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * canvas.width + canvas.width;
    this.y = Math.random() * canvas.height * 0.5;
    this.speed = Math.random() * 10 + 5;
    this.size = Math.random() * 2 + 1;
    this.angle = Math.PI / 4;
  }
  
  update() {
    this.x -= this.speed;
    this.y += this.speed;
    
    if(this.x < -100 || this.y > canvas.height + 100) {
      this.reset();
    }
  }
  
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    
    const gradient = ctx.createLinearGradient(0, 0, -100, 0);
    gradient.addColorStop(0, '#ffaa00');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-100, -1);
    ctx.lineTo(-100, 1);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
}

for(let i=0; i<count; i++) meteors.push(new Meteor());

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  meteors.forEach(meteor => {
    meteor.update();
    meteor.draw();
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
