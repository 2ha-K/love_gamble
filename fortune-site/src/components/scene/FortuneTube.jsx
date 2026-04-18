import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

function seeded(index) {
  return (Math.sin(index * 91.7 + 13.31) + 1) / 2;
}

function FortuneStick({ x, z, height, rotation }) {
  return (
    <group position={[x, 0.22, z]} rotation={[0, 0, rotation]}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.055, height, 0.026]} />
        <meshStandardMaterial color="#edc884" roughness={0.42} metalness={0.08} emissive="#2a1604" />
      </mesh>
      <mesh position={[0, height - 0.08, 0.018]}>
        <boxGeometry args={[0.07, 0.16, 0.012]} />
        <meshStandardMaterial color="#ffe0a0" roughness={0.34} metalness={0.18} emissive="#3d2307" />
      </mesh>
    </group>
  );
}

export function FortuneTube({ drawing }) {
  const groupRef = useRef(null);
  const glowRef = useRef(null);
  const sticks = useMemo(() => (
    Array.from({ length: 15 }, (_, i) => ({
      x: -0.36 + (i % 5) * 0.18 + (seeded(i) - 0.5) * 0.03,
      z: -0.08 + Math.floor(i / 5) * 0.07,
      height: 0.95 + seeded(i + 20) * 0.34,
      rotation: -0.22 + i * 0.03,
    }))
  ), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.82) * 0.045;
    groupRef.current.rotation.y = Math.sin(t * 0.33) * 0.08;
    groupRef.current.rotation.x = Math.sin(t * 0.27) * 0.035;
    if (glowRef.current) {
      glowRef.current.material.opacity = drawing ? 0.36 + Math.sin(t * 7) * 0.08 : 0.1;
      glowRef.current.scale.setScalar(drawing ? 1.15 + Math.sin(t * 4) * 0.04 : 1);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.28, 0.45]} scale={1.48}>
      <mesh ref={glowRef} position={[0, 0.7, -0.12]}>
        <sphereGeometry args={[1.08, 32, 16]} />
        <meshBasicMaterial color="#b5742e" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
      </mesh>

      {sticks.map((stick) => (
        <FortuneStick key={`${stick.x}-${stick.height}`} {...stick} />
      ))}

      <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.62, 0.72, 1.45, 64, 1, true]} />
        <meshStandardMaterial
          color="#4a2110"
          roughness={0.46}
          metalness={0.08}
          emissive="#170804"
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.08, 0.704]} scale={[0.72, 1.1, 1]}>
        <planeGeometry args={[1, 1.24]} />
        <meshBasicMaterial
          color="#c38634"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.77, 0]}>
        <torusGeometry args={[0.62, 0.055, 18, 84]} />
        <meshStandardMaterial color="#d39a3f" roughness={0.22} metalness={0.82} emissive="#2d1704" />
      </mesh>

      <mesh position={[0, -0.72, 0]}>
        <torusGeometry args={[0.72, 0.06, 18, 84]} />
        <meshStandardMaterial color="#a46929" roughness={0.28} metalness={0.76} emissive="#1c0d03" />
      </mesh>

      <mesh position={[0, 0.0, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.018, 10, 80]} />
        <meshStandardMaterial color="#7f1511" roughness={0.48} metalness={0.1} />
      </mesh>

      <mesh position={[0, 0.76, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.012, 10, 80]} />
        <meshBasicMaterial color="#ffcf74" transparent opacity={0.58} blending={THREE.AdditiveBlending} />
      </mesh>

      <Text
        position={[0, 0.04, 0.735]}
        rotation={[0, 0, 0]}
        fontSize={0.28}
        color="#d8a84a"
        anchorX="center"
        anchorY="middle"
      >
        籤
      </Text>
    </group>
  );
}
