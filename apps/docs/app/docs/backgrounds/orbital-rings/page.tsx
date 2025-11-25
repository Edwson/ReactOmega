import { OrbitalRings } from '@reactomega/ui';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function OrbitalRingsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">OrbitalRings</h1>
            <p className="text-lg text-white/80 mb-8">
                Rotating 3D rings/gyroscopes effect using Three.js.
            </p>

            <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-white/10">
                <OrbitalRings color="#8b5cf6" speed={1} radius={1} />

            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Usage</h2>
                <CodeTabs
                    reactCode={`import { OrbitalRings } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative h-screen w-full">
      <OrbitalRings color="#8b5cf6" speed={1} radius={1} />
    </div>
  );
}`}
                    jsCode={`import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('rings').appendChild(renderer.domElement);

const rings = [];
for(let i=0; i<3; i++) {
  const geometry = new THREE.TorusGeometry(10 + i * 5, 0.2, 16, 100);
  const material = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
  const ring = new THREE.Mesh(geometry, material);
  
  ring.rotation.x = Math.random() * Math.PI;
  ring.rotation.y = Math.random() * Math.PI;
  
  scene.add(ring);
  rings.push(ring);
}

camera.position.z = 50;

function animate() {
  requestAnimationFrame(animate);
  rings.forEach((ring, i) => {
    ring.rotation.x += 0.01 * (i + 1);
    ring.rotation.y += 0.005 * (i + 1);
  });
  renderer.render(scene, camera);
}
animate();`}
                    cssCode={`#rings {
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
                                <td className="py-2 px-4 font-mono text-white/60">"#8b5cf6"</td>
                                <td className="py-2 px-4 text-white/80">Color of the rings</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">speed</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">1</td>
                                <td className="py-2 px-4 text-white/80">Speed of rotation</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">radius</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">1</td>
                                <td className="py-2 px-4 text-white/80">Radius of the rings</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
