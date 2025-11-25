'use client';

import { GridMotion } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function GridMotionPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Grid Motion</h1>
                <p className="text-xl text-white/60">
                    Retro-futuristic scrolling 3D grid (Tron/Synthwave style).
                </p>
            </div>

            <ComponentPreview
                component={GridMotion}
                defaultProps={{
                    color: '#00ffff',
                    speed: 1,
                    gridSize: 20,
                }}
                propsConfig={[
                    {
                        name: 'color',
                        type: 'color',
                        default: '#00ffff',
                        description: 'Grid color',
                    },
                    {
                        name: 'speed',
                        type: 'range',
                        default: 1,
                        min: 0.1,
                        max: 5,
                        step: 0.1,
                        description: 'Scroll speed',
                    },
                    {
                        name: 'gridSize',
                        type: 'range',
                        default: 20,
                        min: 5,
                        max: 50,
                        step: 5,
                        description: 'Grid density',
                    },
                ]}
            />

            <div className="prose prose-invert max-w-none">
                <h2>Installation</h2>
                <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                    <code>npm install @reactomega/ui three @react-three/fiber</code>
                </pre>

                <h2>Usage</h2>
                <CodeTabs
                    reactCode={`import { GridMotion } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen">
      <GridMotion color="#00ffff" />
    </div>
  );
}`}
                    jsCode={`import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('grid').appendChild(renderer.domElement);

const gridHelper = new THREE.GridHelper(100, 50, 0x00ffff, 0x00ffff);
scene.add(gridHelper);

camera.position.y = 10;
camera.position.z = 20;
camera.rotation.x = -0.5;

function animate() {
  requestAnimationFrame(animate);
  gridHelper.position.z += 0.1;
  if (gridHelper.position.z > 2) gridHelper.position.z = 0;
  renderer.render(scene, camera);
}
animate();`}
                    cssCode={`#grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
}`}
                />
            </div>
        </div>
    );
}
