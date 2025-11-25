import { CyberGrid } from '@reactomega/ui';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function CyberGridPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">CyberGrid</h1>
            <p className="text-lg text-white/80 mb-8">
                A retro-futuristic 3D grid terrain effect using Three.js and custom shaders.
            </p>

            <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-white/10">
                <CyberGrid color="#00ff88" speed={1} height={1} />

            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Usage</h2>
                <CodeTabs
                    reactCode={`import { CyberGrid } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative h-screen w-full">
      <CyberGrid color="#00ff88" speed={1} height={1} />
    </div>
  );
}`}
                    jsCode={`import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('cyber-grid').appendChild(renderer.domElement);

// Grid
const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
const material = new THREE.MeshBasicMaterial({ 
  color: 0x00ff88, 
  wireframe: true 
});
const grid = new THREE.Mesh(geometry, material);
grid.rotation.x = -Math.PI / 2;
scene.add(grid);

camera.position.y = 10;
camera.position.z = 20;

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.01;
  
  const positions = geometry.attributes.position.array;
  for(let i = 0; i < positions.length; i += 3) {
    // Simple wave effect
    positions[i + 2] = Math.sin(positions[i] / 5 + time) * 2 + Math.cos(positions[i+1] / 5 + time) * 2;
  }
  geometry.attributes.position.needsUpdate = true;
  
  renderer.render(scene, camera);
}
animate();`}
                    cssCode={`#cyber-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
}`}
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Props</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="py-2 px-4">Prop</th>
                                <th className="py-2 px-4">Type</th>
                                <th className="py-2 px-4">Default</th>
                                <th className="py-2 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">color</td>
                                <td className="py-2 px-4 font-mono text-white/60">string</td>
                                <td className="py-2 px-4 font-mono text-white/60">"#00ff88"</td>
                                <td className="py-2 px-4 text-white/80">Color of the grid lines</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">speed</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">1</td>
                                <td className="py-2 px-4 text-white/80">Speed of the grid movement</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">height</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">1</td>
                                <td className="py-2 px-4 text-white/80">Height/Intensity of the terrain distortion</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
