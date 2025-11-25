import { StarTravel } from '@reactomega/ui';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function StarTravelPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">StarTravel</h1>
            <p className="text-lg text-white/80 mb-8">
                A warp speed star travel effect using Three.js.
            </p>

            <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-white/10">
                <StarTravel color="#ffffff" speed={1} starCount={1000} />

            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Usage</h2>
                <CodeTabs
                    reactCode={`import { StarTravel } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative h-screen w-full">
      <StarTravel color="#ffffff" speed={1} starCount={1000} />
    </div>
  );
}`}
                    jsCode={`import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('star-travel').appendChild(renderer.domElement);

const geometry = new THREE.BufferGeometry();
const vertices = [];
for (let i = 0; i < 1000; i++) {
  vertices.push(
    Math.random() * 600 - 300,
    Math.random() * 600 - 300,
    Math.random() * 600 - 300
  );
}
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
const material = new THREE.PointsMaterial({ color: 0xffffff });
const stars = new THREE.Points(geometry, material);
scene.add(stars);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  
  const positions = stars.geometry.attributes.position.array;
  for(let i = 2; i < positions.length; i += 3) {
    positions[i] += 2; // Move towards camera
    if(positions[i] > 200) {
      positions[i] = -400;
    }
  }
  stars.geometry.attributes.position.needsUpdate = true;
  
  renderer.render(scene, camera);
}
animate();`}
                    cssCode={`#star-travel {
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
                                <td className="py-2 px-4 font-mono text-white/60">"#ffffff"</td>
                                <td className="py-2 px-4 text-white/80">Color of the stars</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">speed</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">1</td>
                                <td className="py-2 px-4 text-white/80">Speed of travel</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">starCount</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">1000</td>
                                <td className="py-2 px-4 text-white/80">Number of stars</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
