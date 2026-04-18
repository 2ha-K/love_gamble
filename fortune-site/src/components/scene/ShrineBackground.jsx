import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function seeded(index) {
  return (Math.sin(index * 47.23 + 5.7) + 1) / 2;
}

export function ShrineBackground() {
  const dustRef = useRef(null);
  const positions = useMemo(() => {
    const values = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i += 1) {
      values[i * 3] = (seeded(i) - 0.5) * 12;
      values[i * 3 + 1] = (seeded(i + 1000) - 0.5) * 8;
      values[i * 3 + 2] = -seeded(i + 2000) * 8;
    }
    return values;
  }, []);

  useFrame((state) => {
    if (!dustRef.current) return;
    dustRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.08;
    dustRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.03;
  });

  return (
    <group>
      <mesh position={[0, -0.1, 0.24]}>
        <sphereGeometry args={[1.18, 42, 20]} />
        <meshBasicMaterial
          color="#8a4d1d"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#d9b46a"
          size={0.018}
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <mesh position={[0, -2.55, -1.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.6, 96]} />
        <meshBasicMaterial
          color="#0a0503"
          transparent
          opacity={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, -2.5, -1.36]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.46, 96]} />
        <meshBasicMaterial color="#6d451a" transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, -2.49, -1.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 2.83, 128]} />
        <meshBasicMaterial color="#c58b38" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
