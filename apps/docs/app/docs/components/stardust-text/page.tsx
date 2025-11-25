'use client';

import { StardustText } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function StardustTextPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Stardust Text</h1>
                <p className="text-xl text-white/60">
                    Text made of particles that react to mouse interaction.
                </p>
            </div>

            <ComponentPreview
                component={StardustTextDemo}
                defaultProps={{
                    text: 'ReactΩ',
                    fontSize: 80,
                }}
                propsConfig={[
                    {
                        name: 'text',
                        type: 'string',
                        default: 'ReactΩ',
                        description: 'Text content',
                    },
                    {
                        name: 'fontSize',
                        type: 'range',
                        default: 80,
                        min: 40,
                        max: 120,
                        step: 10,
                        description: 'Font size',
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
                    reactCode={`import { StardustText } from '@reactomega/ui';

export default function App() {
  return (
    <div className="h-64">
      <StardustText text="Cosmic" fontSize={60} />
    </div>
  );
}`}
                    jsCode={`const canvas = document.getElementById('stardust');
const ctx = canvas.getContext('2d');
const text = "Cosmic";
const fontSize = 60;

// Draw text to offscreen canvas to get pixel data
const offscreen = document.createElement('canvas');
const offCtx = offscreen.getContext('2d');
offscreen.width = canvas.width;
offscreen.height = canvas.height;
offCtx.font = \`bold \${fontSize}px sans-serif\`;
offCtx.fillStyle = 'white';
offCtx.fillText(text, 50, 100);

const textData = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;
const particles = [];

// Create particles from text pixels
for(let y = 0; y < canvas.height; y += 4) {
  for(let x = 0; x < canvas.width; x += 4) {
    const index = (y * canvas.width + x) * 4;
    if(textData[index + 3] > 128) {
      particles.push({
        x: x,
        y: y,
        originX: x,
        originY: y,
        vx: 0,
        vy: 0
      });
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(p => {
    // Mouse interaction logic would go here
    // For now, just draw
    ctx.fillStyle = 'white';
    ctx.fillRect(p.x, p.y, 2, 2);
  });
  
  requestAnimationFrame(animate);
}
animate();`}
                    cssCode={`#stardust {
  width: 100%;
  height: 300px;
  background: #000;
}`}
                />
            </div>
        </div>
    );
}

function StardustTextDemo(props: any) {
    return (
        <div className="h-64 w-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
            <StardustText {...props} />
        </div>
    );
}
