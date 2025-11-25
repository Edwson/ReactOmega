# ReactΩ - Getting Started Guide

## Installation

### For React/Next.js Projects

```bash
npm install @reactomega/ui
# or
yarn add @reactomega/ui
# or
pnpm add @reactomega/ui
```

### Required Peer Dependencies

Some components require additional dependencies:

```bash
# For WebGL/3D components (Galaxy, BlackHole, Nebula, etc.)
npm install three @react-three/fiber @react-three/drei

# For animation components (Dock, MagneticButton, etc.)
npm install framer-motion
```

## Usage

### React/Next.js Usage

```tsx
import { Hyperdrive, GlowCard } from '@reactomega/ui';

export default function App() {
  return (
    <div className="relative w-full h-screen">
      {/* Background */}
      <Hyperdrive speed={2} color="#ffffff" />
      
      {/* UI Component */}
      <div className="relative z-10 p-10">
        <GlowCard>
          <h1>Welcome to ReactΩ</h1>
          <p>Premium cosmic animations</p>
        </GlowCard>
      </div>
    </div>
  );
}
```

### Vanilla JavaScript Usage

If you're not using React, you can use the vanilla JavaScript versions:

#### 1. Include via CDN

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; overflow: hidden; }
    #canvas { position: fixed; top: 0; left: 0; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  
  <script>
    // Hyperdrive Effect (Vanilla JS)
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars = [];
    const starCount = 200;
    const speed = 10;
    
    // Initialize stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * canvas.width,
      });
    }
    
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      stars.forEach(star => {
        star.z -= speed;
        
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
          star.z = canvas.width;
        }
        
        const sx = (star.x / star.z) * canvas.width;
        const sy = (star.y / star.z) * canvas.height;
        const size = (1 - star.z / canvas.width) * 3;
        
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1 - star.z / canvas.width;
        ctx.fillRect(sx, sy, size, size);
      });
      
      ctx.restore();
      requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  </script>
</body>
</html>
```

#### 2. Starfield Effect (Vanilla JS)

```html
<canvas id="starfield"></canvas>

<script>
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2,
    opacity: Math.random(),
    twinkleSpeed: Math.random() * 0.02,
  }));
  
  function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
      star.opacity += star.twinkleSpeed;
      if (star.opacity > 1 || star.opacity < 0) {
        star.twinkleSpeed *= -1;
      }
      
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
</script>
```

## Component Categories

### Backgrounds (17 total)
- **Canvas-based**: Hyperdrive, Starfield, CosmicDust, ShootingStars, Particles, WarpSpeed, Meteor, Constellation
- **WebGL-based**: Nebula, BlackHole, Aurora, Galaxy, GridMotion, Supernova, Wormhole, PlasmaBall, QuantumField

### UI Components (17 total)
- **Interactive**: GlowCard, OrbitMenu, MagneticButton, SpotlightCard, Dock, LiquidButton, FloatingCard, ParallaxCard, MorphCard
- **Text Effects**: StardustText, TextReveal, TypewriterEffect, ShimmerText, GradientText, BeamText
- **Buttons**: CosmicButton, NeonButton, RippleButton, PulseButton
- **Cards**: HolographicCard, GlassCard, StarBorder

## Customization

All components accept props for customization:

```tsx
<Galaxy 
  count={10000}
  color="#2e9aff"
  radius={5}
  arms={3}
  spin={1}
/>

<GlowCard 
  glowColor="#ff00ff"
  intensity={1.5}
>
  Your content
</GlowCard>
```

## TypeScript Support

ReactΩ is built with TypeScript and includes full type definitions:

```tsx
import { HyperdriveProps, GlowCardProps } from '@reactomega/ui';

const config: HyperdriveProps = {
  speed: 2,
  color: '#ffffff',
  count: 200,
};
```

## Performance Tips

1. **Limit particle counts** for better performance on lower-end devices
2. **Use CSS-based components** when possible for better performance
3. **Lazy load** WebGL components when not immediately visible
4. **Reduce animation speed** on mobile devices

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (WebGL components may have minor differences)
- Mobile: ✅ Supported (reduce particle counts for better performance)

## License

MIT License - feel free to use in personal and commercial projects!

## Support

- Documentation: [Your docs URL]
- GitHub: [Your GitHub URL]
- Issues: [Your issues URL]
