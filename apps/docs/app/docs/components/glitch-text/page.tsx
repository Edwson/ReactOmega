'use client';

import { GlitchText } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function GlitchTextPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">GlitchText</h1>
        <p className="text-xl text-white/60">Premium UI component with cosmic animations.</p>
      </div>
      <ComponentPreview
        component={GlitchText}
        defaultProps={{
          text: 'Glitch Text',
          className: 'text-6xl',
        }}
        propsConfig={[
          {
            name: 'text',
            type: 'string',
            default: 'Glitch Text',
            description: 'Text content to display',
          },
          {
            name: 'glitchColor',
            type: 'string',
            default: '#00ffff',
            description: 'Primary glitch color',
          },
          {
            name: 'glitchColor2',
            type: 'string',
            default: '#ff00ff',
            description: 'Secondary glitch color',
          },
        ]}
      />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Usage</h2>
        <CodeTabs
          reactCode={`import { GlitchText } from '@reactomega/ui';

export default function App() {
  return (
    <GlitchText 
      text="Glitch Text" 
      className="text-6xl" 
    />
  );
}`}
          jsCode={`<h1 class="glitch-text" data-text="Glitch Text">Glitch Text</h1>`}
          cssCode={`.glitch-text {
  position: relative;
  font-size: 4rem;
  font-weight: bold;
  color: white;
  letter-spacing: 0.1em;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -2px 0 #00ffff;
  clip: rect(24px, 550px, 90px, 0);
  animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
}

.glitch-text::after {
  left: -2px;
  text-shadow: -2px 0 #ff00ff;
  clip: rect(85px, 550px, 140px, 0);
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
}

@keyframes glitch-anim-1 {
  0% { clip: rect(20px, 9999px, 15px, 0); }
  20% { clip: rect(60px, 9999px, 70px, 0); }
  40% { clip: rect(20px, 9999px, 80px, 0); }
  60% { clip: rect(90px, 9999px, 10px, 0); }
  80% { clip: rect(50px, 9999px, 30px, 0); }
  100% { clip: rect(10px, 9999px, 90px, 0); }
}

@keyframes glitch-anim-2 {
  0% { clip: rect(90px, 9999px, 10px, 0); }
  20% { clip: rect(10px, 9999px, 80px, 0); }
  40% { clip: rect(50px, 9999px, 30px, 0); }
  60% { clip: rect(20px, 9999px, 60px, 0); }
  80% { clip: rect(70px, 9999px, 20px, 0); }
  100% { clip: rect(30px, 9999px, 50px, 0); }
}`}
        />
      </div>
    </div>
  );
}
