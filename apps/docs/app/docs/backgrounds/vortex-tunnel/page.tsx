'use client';

import { VortexTunnel } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function VortexTunnelPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Vortex Tunnel</h1>
        <p className="text-xl text-white/60">Hypnotic spiral tunnel effect with rotation animation.</p>
      </div>
      <ComponentPreview
        component={VortexTunnel}
        defaultProps={{ color: '#ff00ff', speed: 1, intensity: 1 }}
        propsConfig={[
          { name: 'color', type: 'color', default: '#ff00ff', description: 'Vortex color' },
          { name: 'speed', type: 'range', default: 1, min: 0.5, max: 3, step: 0.1, description: 'Rotation speed' },
          { name: 'intensity', type: 'range', default: 1, min: 0.5, max: 2, step: 0.1, description: 'Brightness' },
        ]}
      />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Usage</h2>
        <CodeTabs
          reactCode={`import { VortexTunnel } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <VortexTunnel color="#ff00ff" />
    </div>
  );
}`}
          jsCode={`<canvas id="vortex"></canvas>

<script>
const canvas = document.getElementById('vortex');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let angle = 0;
const cx = canvas.width / 2;
const cy = canvas.height / 2;

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 2;
  
  for(let i = 0; i < 20; i++) {
    const radius = (i * 20 + angle * 10) % 400;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  angle += 0.05;
  requestAnimationFrame(animate);
}

animate();
</script>`}
        />
      </div>
    </div>
  );
}
