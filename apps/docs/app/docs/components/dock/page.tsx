'use client';

import { Dock } from '@reactomega/ui';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { CodeTabs } from '@/components/ui/CodeTabs';
import { Home, Search, Bell, Settings, User } from 'lucide-react';

export default function DockPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Dock</h1>
                <p className="text-xl text-white/60">
                    macOS-style dock with smooth magnification effect.
                </p>
            </div>

            <ComponentPreview
                component={DockDemo}
                defaultProps={{}}
                propsConfig={[]}
            />

            <div className="prose prose-invert max-w-none">
                <h2>Installation</h2>
                <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                    <code>npm install @reactomega/ui framer-motion lucide-react</code>
                </pre>

                <h2>Usage</h2>
                <CodeTabs
                    reactCode={`import { Dock } from '@reactomega/ui';
import { Home, Search, Bell } from 'lucide-react';

export default function App() {
  const items = [
    { icon: <Home />, label: 'Home' },
    { icon: <Search />, label: 'Search' },
    { icon: <Bell />, label: 'Notifications' },
  ];

  return <Dock items={items} />;
}`}
                    jsCode={`<div class="dock">
  <div class="dock-item">🏠</div>
  <div class="dock-item">🔍</div>
  <div class="dock-item">🔔</div>
</div>

<script>
const dock = document.querySelector('.dock');
const items = document.querySelectorAll('.dock-item');

dock.addEventListener('mousemove', (e) => {
  items.forEach(item => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    let scale = 1;
    const distance = Math.sqrt(x*x + y*y);
    
    if (distance < 150) {
      scale = 1 + (150 - distance) / 150;
    }
    
    item.style.transform = \`scale(\${scale})\`;
  });
});

dock.addEventListener('mouseleave', () => {
  items.forEach(item => {
    item.style.transform = 'scale(1)';
  });
});
</script>`}
                    cssCode={`.dock {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  align-items: flex-end;
  height: 64px;
}

.dock-item {
  width: 40px;
  height: 40px;
  background: #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: transform 0.1s;
  cursor: pointer;
}`}
                />
            </div>
        </div>
    );
}

function DockDemo() {
    const items = [
        { icon: <Home className="w-full h-full" />, label: 'Home' },
        { icon: <Search className="w-full h-full" />, label: 'Search' },
        { icon: <Bell className="w-full h-full" />, label: 'Notifications' },
        { icon: <Settings className="w-full h-full" />, label: 'Settings' },
        { icon: <User className="w-full h-full" />, label: 'Profile' },
    ];

    return (
        <div className="flex items-center justify-center h-full w-full">
            <Dock items={items} />
        </div>
    );
}
