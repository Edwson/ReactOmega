'use client';

import { OrbitMenu } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';

export default function OrbitMenuPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Orbit Menu</h1>
                <p className="text-xl text-white/60">
                    Circular navigation menu with orbiting items.
                </p>
            </div>

            <ComponentPreview
                component={OrbitMenuDemo}
                defaultProps={{
                    radius: 100,
                    color: '#ffffff',
                }}
                propsConfig={[
                    {
                        name: 'radius',
                        type: 'range',
                        default: 100,
                        min: 50,
                        max: 200,
                        step: 10,
                        description: 'Radius of the orbit',
                    },
                    {
                        name: 'color',
                        type: 'color',
                        default: '#ffffff',
                        description: 'Color of the menu button',
                    },
                ]}
            />

            <div className="prose prose-invert max-w-none">
                <h2>Installation</h2>
                <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                    <code>npm install @reactomega/ui framer-motion</code>
                </pre>

                <h2>Usage</h2>
                <h2>Usage</h2>
                <CodeTabs
                    reactCode={`import { OrbitMenu } from '@reactomega/ui';

export default function App() {
  const items = [
    { label: 'Home', onClick: () => console.log('Home') },
    { label: 'About', onClick: () => console.log('About') },
    { label: 'Contact', onClick: () => console.log('Contact') },
    { label: 'Blog', onClick: () => console.log('Blog') },
  ];

  return (
    <div className="flex items-center justify-center h-screen">
      <OrbitMenu items={items} radius={100} />
    </div>
  );
}`}
                    jsCode={`<div class="orbit-menu">
  <div class="center-btn">Menu</div>
  <div class="orbit-item item-1">1</div>
  <div class="orbit-item item-2">2</div>
  <div class="orbit-item item-3">3</div>
  <div class="orbit-item item-4">4</div>
</div>`}
                    cssCode={`.orbit-menu {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-btn {
  width: 60px;
  height: 60px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  cursor: pointer;
}

.orbit-item {
  position: absolute;
  width: 40px;
  height: 40px;
  background: #8b5cf6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  opacity: 0;
  transform: scale(0);
}

.orbit-menu:hover .orbit-item {
  opacity: 1;
  transform: scale(1);
}

.orbit-menu:hover .item-1 { transform: rotate(0deg) translate(80px) rotate(0deg); }
.orbit-menu:hover .item-2 { transform: rotate(90deg) translate(80px) rotate(-90deg); }
.orbit-menu:hover .item-3 { transform: rotate(180deg) translate(80px) rotate(-180deg); }
.orbit-menu:hover .item-4 { transform: rotate(270deg) translate(80px) rotate(-270deg); }`}
                />
            </div>
        </div>
    );
}

function OrbitMenuDemo(props: any) {
    const items = [
        { label: 'Home' },
        { label: 'About' },
        { label: 'Work' },
        { label: 'Blog' },
        { label: 'Contact' },
    ];

    return (
        <div className="flex items-center justify-center h-full">
            <OrbitMenu items={items} {...props} />
        </div>
    );
}
