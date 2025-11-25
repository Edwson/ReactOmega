'use client';

import { Galaxy } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function GalaxyPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Galaxy</h1>
                <p className="text-xl text-white/60">
                    3D spiral galaxy effect using React Three Fiber.
                </p>
            </div>

            <ComponentPreview
                component={Galaxy}
                defaultProps={{
                    count: 10000,
                    color: '#2e9aff',
                    radius: 5,
                    arms: 3,
                    spin: 1,
                }}
                propsConfig={[
                    {
                        name: 'count',
                        type: 'number',
                        default: 5000,
                        description: 'Number of stars',
                    },
                    {
                        name: 'color',
                        type: 'color',
                        default: '#ff6030',
                        description: 'Core color',
                    },
                    {
                        name: 'radius',
                        type: 'range',
                        default: 5,
                        min: 1,
                        max: 10,
                        step: 0.5,
                        description: 'Galaxy radius',
                    },
                    {
                        name: 'arms',
                        type: 'range',
                        default: 3,
                        min: 2,
                        max: 10,
                        step: 1,
                        description: 'Number of spiral arms',
                    },
                    {
                        name: 'spin',
                        type: 'range',
                        default: 1,
                        min: 0.1,
                        max: 5,
                        step: 0.1,
                        description: 'Spin factor',
                    },
                ]}
            />

            <div className="prose prose-invert max-w-none">
                <h2>Installation</h2>
                <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                    <code>npm install @reactomega/ui three @react-three/fiber @react-three/drei</code>
                </pre>

                <h2>Usage</h2>
                <CodeTabs
                    reactCode={`import { Galaxy } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen">
      <Galaxy color="#ff6030" />
    </div>
  );
}`}
                    jsCode={`import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('galaxy').appendChild(renderer.domElement);

const parameters = {
  count: 10000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984'
};

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  if(points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for(let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
    
    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);
    
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
};

generateGalaxy();
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;

function animate() {
  requestAnimationFrame(animate);
  points.rotation.y += 0.001;
  renderer.render(scene, camera);
}
animate();`}
                    cssCode={`#galaxy {
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
