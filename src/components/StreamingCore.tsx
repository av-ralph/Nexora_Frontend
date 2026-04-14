import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function StreamingCore() {
  const group = useRef<THREE.Group>(null!);
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const core = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!group.current) return;

    const isCompact = state.viewport.width < 6;
    const intensity = isCompact ? 0.55 : 1;
    const floatY = Math.sin(state.clock.elapsedTime * 0.85) * 0.12 * intensity;
    const targetX = state.mouse.y * 0.08 * intensity;
    const targetY = state.mouse.x * 0.08 * intensity;

    group.current.rotation.y += 0.0035 * intensity;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.05);
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      group.current.rotation.y + targetY,
      0.05
    );
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, floatY, 0.05);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, state.mouse.x * 0.25 * intensity, 0.03);

    if (ring1.current) {
      ring1.current.rotation.z += 0.008 * intensity;
    }

    if (ring2.current) {
      ring2.current.rotation.z -= 0.01 * intensity;
    }

    if (core.current) {
      const pulse = 2.2 + Math.sin(state.clock.elapsedTime * 1.8) * 0.1;
      (core.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 0.3, 64]} />
        <meshStandardMaterial
          color="#111827"
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.6,
              0,
              Math.sin(angle) * 0.6
            ]}
          >
            <cylinderGeometry args={[0.15, 0.15, 0.4, 32]} />
            <meshStandardMaterial color="#050510" metalness={0.5} roughness={0.3} />
          </mesh>
        );
      })}

      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={1.8}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={ring2} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[2.5, 0.03, 16, 100]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={1.4}
          metalness={0.35}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={core}>
        <sphereGeometry args={[0.4, 64, 64]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={2.5}
          metalness={0.5}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}
