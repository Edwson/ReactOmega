'use client';

import { Constellation } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function ConstellationPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Constellation</h1>
        <p className="text-xl text-white/60">Connected star patterns forming recognizable constellations.</p>
      </div>
      <ComponentPreview
        component={Constellation}
        defaultProps={{ count: 100, color: '#ffffff', lineColor: '#ffffff' }}
        propsConfig={[
          { name: 'color', type: 'color', default: '#ffffff', description: 'Star color' },
          { name: 'lineColor', type: 'color', default: '#ffffff', description: 'Connection line color' },
        ]}
      />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Usage</h2>
        <CodeTabs
          reactCode={`import { Constellation } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black">
      <Constellation count={100} color="#ffffff" />
    </div>
  );
}`}
          jsCode={`<canvas id="constellation"></canvas>

<script>
const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
const count = 100;

class Star {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    if(this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if(this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  
  draw() {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for(let i=0; i<count; i++) stars.push(new Star());

function animate() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  stars.forEach(star => {
    star.update();
    star.draw();
    
    stars.forEach(other => {
      const dx = star.x - other.x;
      const dy = star.y - other.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if(dist < 100) {
        ctx.strokeStyle = \`rgba(255, 255, 255, \${1 - dist/100})\`;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    });
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
