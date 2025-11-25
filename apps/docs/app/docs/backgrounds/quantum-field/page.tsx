'use client';

import { QuantumField } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function QuantumFieldPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Quantum Field</h1>
        <p className="text-xl text-white/60">Quantum field visualization with wave functions and particle-wave duality.</p>
      </div>
      <ComponentPreview
        component={QuantumField}
        defaultProps={{ color: '#00d4ff', intensity: 1, speed: 1 }}
        propsConfig={[
          { name: 'color', type: 'color', default: '#00d4ff', description: 'Field color' },
          { name: 'intensity', type: 'range', default: 1, min: 0.5, max: 2, step: 0.1, description: 'Intensity' },
          { name: 'speed', type: 'range', default: 1, min: 0.5, max: 3, step: 0.1, description: 'Wave speed' },
        ]}
      />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Usage</h2>
        <CodeTabs
          reactCode={`import { QuantumField } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black">
      <QuantumField color="#00d4ff" />
    </div>
  );
}`}
          jsCode={`<canvas id="quantum"></canvas>

<script>
const canvas = document.getElementById('quantum');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let time = 0;

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for(let x = 0; x < canvas.width; x += 10) {
    const y = canvas.height / 2 + Math.sin(x * 0.01 + time) * 50 + Math.cos(x * 0.02 + time) * 30;
    if(x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  
  ctx.stroke();
  time += 0.05;
  requestAnimationFrame(animate);
}

animate();
</script>`}
        />
      </div>
    </div>
  );
}
