import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';

const Particles = ({ count = 3000 }) => {
  const mesh = useRef<any>(null!);
  const time = useRef(0);

  const dummy = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return positions;
  }, [count]);

  useFrame((_state, delta) => {
    time.current += delta;
    if (mesh.current) {
      mesh.current.rotation.y = time.current * 0.02;
      mesh.current.rotation.x = time.current * 0.01;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={dummy.length / 3}
          array={dummy}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.01}
        color="#818cf8"
        transparent
        opacity={0.2}
        sizeAttenuation
      />
    </points>
  );
};

const FloatingCore = () => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 64, 64]} position={[0, 0, -2]}>
        <MeshDistortMaterial
          color="#4f46e5"
          speed={3}
          distort={0.4}
          radius={1}
          emissive="#4f46e5"
          emissiveIntensity={0.5}
          transparent
          opacity={0.1}
        />
      </Sphere>
    </Float>
  );
};

const Scene = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <Particles />
        <FloatingCore />
      </Canvas>
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
    </div>
  );
};

export default Scene;