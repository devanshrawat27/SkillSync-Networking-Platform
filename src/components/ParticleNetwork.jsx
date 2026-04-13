import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

// Helper to generate random points in a sphere
function generateRandomPointsInSphere(count, radius = 1.5) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = Math.cbrt(Math.random()) * radius;
    
    positions[i] = r * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = r * Math.cos(phi);
  }
  return positions;
}

export function ParticleNetwork(props) {
  const ref = useRef();
  const particlesCount = 1000;
  
  useEffect(() => {
    if (ref.current) {
      const positions = generateRandomPointsInSphere(particlesCount, 1.5);
      ref.current.geometry.setAttribute('position', {
        array: positions,
        itemSize: 3,
        usage: 34962 // DYNAMIC_DRAW
      });
    }
  }, []);

  useFrame((state) => {
    if (ref.current && ref.current.geometry) {
      const positions = ref.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(state.clock.elapsedTime + i) * 0.0005;
        positions[i + 1] += Math.cos(state.clock.elapsedTime + i) * 0.0005;
        positions[i + 2] += Math.sin(state.clock.elapsedTime + i * 0.5) * 0.0005;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
      ref.current.rotation.x -= 0.0001;
      ref.current.rotation.y -= 0.0001;
    }
  });

  return (
    <group {...props}>
      <Points ref={ref}>
        <PointMaterial
          transparent
          color="#7C3AED"
          size={0.02}
          sizeAttenuation
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}
