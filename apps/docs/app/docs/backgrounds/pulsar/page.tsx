'use client';

import { Pulsar } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function PulsarPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Pulsar</h1>
        <p className="text-xl text-white/60">Pulsing neutron star with radiation beams and energy rings.</p>
      </div>
      <ComponentPreview
        component={Pulsar}
        defaultProps={{ color: '#00ff88', speed: 1, intensity: 1 }}
        propsConfig={[
          { name: 'color', type: 'color', default: '#00ff88', description: 'Pulsar color' },
          { name: 'speed', type: 'range', default: 1, min: 0.5, max: 3, step: 0.1, description: 'Pulse speed' },
          { name: 'intensity', type: 'range', default: 1, min: 0.5, max: 2, step: 0.1, description: 'Brightness' },
        ]}
      />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Usage</h2>
        <CodeTabs
          reactCode={`import { Pulsar } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <Pulsar color="#00ff88" />
    </div>
  );
}`}
          jsCode={`<div class="pulsar"></div>`}
          cssCode={`.pulsar {
  width: 100px;
  height: 100px;
  background: #00ff88;
  border-radius: 50%;
  box-shadow: 0 0 20px #00ff88;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(0, 255, 136, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
}`}
        />
      </div>
    </div>
  );
}
