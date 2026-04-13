import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { ParticleNetwork } from './ParticleNetwork';
import { Suspense } from 'react';

export function Hero3D() {
  return (
    <Canvas className="w-full h-full">
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={75} />
        <ParticleNetwork />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
      </Suspense>
    </Canvas>
  );
}
