'use client';

import { Hyperdrive } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function HyperdrivePage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Hyperdrive</h1>
                <p className="text-xl text-white/60">
                    Warp speed hyperspace travel effect with interactive controls.
                </p>
            </div>

            <ComponentPreview
                component={Hyperdrive}
                defaultProps={{
                    speed: 1.5,
                    starCount: 500,
                    starColor: '#ffffff',
                    trailLength: 0.5,
                    direction: 'forward',
                    interactive: true,
                }}
                propsConfig={[
                    {
                        name: 'speed',
                        type: 'range',
                        default: 1.5,
                        min: 0.1,
                        max: 5,
                        step: 0.1,
                        description: 'Animation speed multiplier',
                    },
                    {
                        name: 'starCount',
                        type: 'range',
                        default: 500,
                        min: 100,
                        max: 2000,
                        step: 100,
                        description: 'Number of stars in the field',
                    },
                    {
                        name: 'starColor',
                        type: 'color',
                        default: '#ffffff',
                        description: 'Color of the stars',
                    },
                    {
                        name: 'trailLength',
                        type: 'range',
                        default: 0.5,
                        min: 0,
                        max: 1,
                        step: 0.1,
                        description: 'Length of star trails',
                    },
                    {
                        name: 'direction',
                        type: 'select',
                        default: 'forward',
                        options: [
                            { label: 'Forward', value: 'forward' },
                            { label: 'Backward', value: 'backward' },
                        ],
                        description: 'Direction of travel',
                    },
                    {
                        name: 'interactive',
                        type: 'boolean',
                        default: true,
                        description: 'Enable mouse interaction',
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
                    reactCode={`import { Hyperdrive } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen">
      <Hyperdrive speed={1.5} starCount={500} interactive />
    </div>
  );
}`}
                    jsCode={`import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('hyperdrive').appendChild(renderer.domElement);

// Stars
const geometry = new THREE.BufferGeometry();
const vertices = [];
for (let i = 0; i < 1000; i++) {
  vertices.push(
    Math.random() * 2000 - 1000,
    Math.random() * 2000 - 1000,
    Math.random() * 2000 - 1000
  );
}
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
const stars = new THREE.Points(geometry, material);
scene.add(stars);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  stars.position.z += 2;
  if (stars.position.z > 1000) stars.position.z = -1000;
  renderer.render(scene, camera);
}
animate();`}
                    cssCode={`#hyperdrive {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}`}
                />
            </div>
        </div>
    );
}
