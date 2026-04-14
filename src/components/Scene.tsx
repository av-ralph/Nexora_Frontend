import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import StreamingCore from './StreamingCore';

export default function Scene() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.45} />
        <spotLight
          position={[5, 5, 7]}
          angle={0.2}
          intensity={1.4}
          penumbra={0.5}
          color="#a78bfa"
        />

        {/* Your Model */}
        <StreamingCore />

        {/* Cinematic lighting */}
        <Environment preset="city" />
      </Canvas>

      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1228]/30 via-transparent to-[#050510]/80 pointer-events-none" />
    </div>
  );
}