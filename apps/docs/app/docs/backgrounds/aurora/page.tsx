'use client';

import { Aurora } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function AuroraPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Aurora</h1>
                <p className="text-xl text-white/60">
                    Northern lights effect using WebGL shaders.
                </p>
            </div>

            <ComponentPreview
                component={Aurora}
                defaultProps={{
                    color: '#00ff88',
                    speed: 1,
                }}
                propsConfig={[
                    {
                        name: 'color',
                        type: 'color',
                        default: '#00ff88',
                        description: 'Color of the aurora',
                    },
                    {
                        name: 'speed',
                        type: 'range',
                        default: 1,
                        min: 0.1,
                        max: 5,
                        step: 0.1,
                        description: 'Animation speed',
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
                    reactCode={`import { Aurora } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen">
      <Aurora color="#00ff88" />
    </div>
  );
}`}
                    jsCode={`import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('aurora').appendChild(renderer.domElement);

// Aurora Shader
const vertexShader = \`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
\`;

const fragmentShader = \`
  uniform float time;
  uniform vec3 color;
  varying vec2 vUv;
  
  void main() {
    float y = vUv.y;
    float aurora = 0.0;
    
    // Simple aurora simulation
    for(float i=0.0; i<3.0; i++) {
      aurora += sin(vUv.x * 10.0 + time * (i + 1.0)) * 0.5 * (1.0 - y);
    }
    
    gl_FragColor = vec4(color * aurora, 1.0);
  }
\`;

const material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color('#00ff88') }
  },
  vertexShader,
  fragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending
});

const geometry = new THREE.PlaneGeometry(20, 10, 32, 32);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  material.uniforms.time.value += 0.01;
  renderer.render(scene, camera);
}
animate();`}
                    cssCode={`#aurora {
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
