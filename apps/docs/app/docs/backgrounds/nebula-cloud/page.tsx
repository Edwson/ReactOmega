import { NebulaCloud } from '@reactomega/ui';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function NebulaCloudPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">NebulaCloud</h1>
            <p className="text-lg text-white/80 mb-8">
                A volumetric gas cloud background effect using Three.js and custom shaders.
            </p>

            <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-white/10">
                <NebulaCloud color="#8b5cf6" speed={1} opacity={0.5} />

            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Usage</h2>
                <CodeTabs
                    reactCode={`import { NebulaCloud } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative h-screen w-full">
      <NebulaCloud color="#8b5cf6" speed={1} opacity={0.5} />
    </div>
  );
}`}
                    jsCode={`// Three.js implementation
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('nebula-container').appendChild(renderer.domElement);

// Create cloud particles
const textureLoader = new THREE.TextureLoader();
const cloudTexture = textureLoader.load('cloud.png');
const cloudGeo = new THREE.PlaneGeometry(500, 500);
const cloudMaterial = new THREE.MeshLambertMaterial({
  map: cloudTexture,
  transparent: true,
  opacity: 0.5,
  color: 0x8b5cf6
});

const clouds = [];
for(let i=0; i<25; i++) {
  const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
  cloud.position.set(
    Math.random()*800 - 400,
    500,
    Math.random()*500 - 450
  );
  cloud.rotation.z = Math.random()*360;
  scene.add(cloud);
  clouds.push(cloud);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  clouds.forEach(cloud => {
    cloud.rotation.z -= 0.002;
  });
  renderer.render(scene, camera);
}
animate();`}
                    cssCode={`#nebula-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
                                <td className="py-2 px-4 text-white/80">Primary color of the nebula</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">speed</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">1</td>
                                <td className="py-2 px-4 text-white/80">Speed of the cloud movement</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-4 font-mono text-purple-400">opacity</td>
                                <td className="py-2 px-4 font-mono text-white/60">number</td>
                                <td className="py-2 px-4 font-mono text-white/60">0.5</td>
                                <td className="py-2 px-4 text-white/80">Opacity of the clouds</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
