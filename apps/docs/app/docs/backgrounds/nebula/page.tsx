'use client';

import { Nebula } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function NebulaPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Nebula</h1>
                <p className="text-xl text-white/60">
                    Colorful gas cloud effect using WebGL shaders.
                </p>
            </div>

            <ComponentPreview
                component={Nebula}
                defaultProps={{
                    speed: 1,
                    nebulaColor: '#8a2be2',
                    backgroundColor: '#000000',
                    density: 1,
                }}
                propsConfig={[
                    {
                        name: 'speed',
                        type: 'range',
                        default: 1,
                        min: 0.1,
                        max: 5,
                        step: 0.1,
                        description: 'Animation speed multiplier',
                    },
                    {
                        name: 'nebulaColor',
                        type: 'color',
                        default: '#8a2be2',
                        description: 'Color of the nebula',
                    },
                    {
                        name: 'backgroundColor',
                        type: 'color',
                        default: '#000000',
                        description: 'Background color',
                    },
                    {
                        name: 'density',
                        type: 'range',
                        default: 1,
                        min: 0.1,
                        max: 3,
                        step: 0.1,
                        description: 'Density of the nebula',
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
                    reactCode={`import { Nebula } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen">
      <Nebula speed={1} nebulaColor="#8a2be2" />
    </div>
  );
}`}
                    jsCode={`import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('nebula').appendChild(renderer.domElement);

// Cloud texture loader
const loader = new THREE.TextureLoader();
const texture = loader.load('cloud.png');

const cloudGeo = new THREE.PlaneGeometry(500, 500);
const cloudMaterial = new THREE.MeshLambertMaterial({
  map: texture,
  transparent: true,
  opacity: 0.5,
  color: 0x8a2be2
});

const clouds = [];
for(let i=0; i<20; i++) {
  const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
  cloud.position.set(
    Math.random()*800 - 400,
    500,
    Math.random()*500 - 450
  );
  cloud.rotation.z = Math.random()*360;
  cloud.material.opacity = 0.6;
  scene.add(cloud);
  clouds.push(cloud);
}

// Light
const light = new THREE.PointLight(0xffffff, 1, 1000);
light.position.set(0, 0, 50);
scene.add(light);

function animate() {
  requestAnimationFrame(animate);
  clouds.forEach(cloud => {
    cloud.rotation.z -= 0.001;
  });
  renderer.render(scene, camera);
}
animate();`}
                    cssCode={`#nebula {
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
