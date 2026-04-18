import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

function seeded(index) {
  return (Math.sin(index * 91.7 + 13.31) + 1) / 2;
}

function FortuneCardSlip({ x, z, y, width, height, rotation, tilt, shade }) {
  return (
    <group position={[x, y, z]} rotation={[tilt, 0, rotation]}>
      <mesh>
        <boxGeometry args={[width, height, 0.032]} />
        <meshStandardMaterial
          color={shade}
          roughness={0.42}
          metalness={0.14}
          emissive="#2a1604"
          emissiveIntensity={0.06}
        />
      </mesh>
      <mesh position={[0, height * 0.08, 0.022]}>
        <boxGeometry args={[width * 0.72, height * 0.48, 0.01]} />
        <meshStandardMaterial
          color="#b3741c"
          roughness={0.28}
          metalness={0.72}
          emissive="#3d2307"
          emissiveIntensity={0.1}
        />
      </mesh>
      <mesh position={[0, -height * 0.36, 0.028]}>
        <boxGeometry args={[width * 0.6, 0.018, 0.008]} />
        <meshBasicMaterial color="#fff0b6" transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

export function FortuneTube({ drawing, disabled, onDraw }) {
  const groupRef = useRef(null);
  const glowRef = useRef(null);
  const slips = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        x: -0.5 + i * 0.1 + (seeded(i) - 0.5) * 0.02,
        z: -0.08 + seeded(i + 12) * 0.16,
        y: 0.78 + seeded(i + 30) * 0.12,
        width: 0.19 + seeded(i + 44) * 0.035,
        height: 1.05 + seeded(i + 20) * 0.28,
        rotation: -0.22 + i * 0.044,
        tilt: -0.12 + seeded(i + 70) * 0.16,
        shade: i % 3 === 0 ? "#f1d18c" : i % 3 === 1 ? "#d8a94f" : "#e6bd6f",
      })),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.82) * 0.035;
    groupRef.current.rotation.y = Math.sin(t * 0.33) * 0.08;
    groupRef.current.rotation.x = Math.sin(t * 0.27) * 0.025;
    if (glowRef.current) {
      glowRef.current.material.opacity = drawing ? 0.36 + Math.sin(t * 7) * 0.08 : 0.16;
      glowRef.current.scale.setScalar(drawing ? 1.15 + Math.sin(t * 4) * 0.04 : 1);
    }
  });

  const triggerDraw = (event) => {
    event.stopPropagation();
    if (!disabled) onDraw?.();
  };

  return (
    <group
      ref={groupRef}
      position={[0, -0.22, 0.45]}
      scale={1.25}
      onClick={triggerDraw}
      onPointerOver={() => {
        document.body.style.cursor = disabled ? "default" : "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh ref={glowRef} position={[0, 0.62, -0.1]}>
        <sphereGeometry args={[1.0, 32, 16]} />
        <meshBasicMaterial color="#b5742e" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
      </mesh>

      {slips.map((slip) => (
        <FortuneCardSlip key={`${slip.x}-${slip.height}`} {...slip} />
      ))}

      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.64, 0.76, 1.18, 80, 1, true]} />
        <meshStandardMaterial
          color="#321207"
          roughness={0.38}
          metalness={0.18}
          emissive="#210804"
          emissiveIntensity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.14, 0.69]} scale={[0.74, 0.88, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#c38634"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.68, 0]}>
        <torusGeometry args={[0.64, 0.045, 18, 96]} />
        <meshStandardMaterial color="#d49b3e" roughness={0.2} metalness={0.86} emissive="#2d1704" />
      </mesh>

      <mesh position={[0, -0.55, 0]}>
        <torusGeometry args={[0.76, 0.052, 18, 96]} />
        <meshStandardMaterial color="#a46929" roughness={0.28} metalness={0.76} emissive="#1c0d03" />
      </mesh>

      <mesh position={[0, -0.82, 0]}>
        <cylinderGeometry args={[0.44, 0.58, 0.34, 80]} />
        <meshStandardMaterial color="#2a0f07" roughness={0.42} metalness={0.22} emissive="#120503" />
      </mesh>

      <mesh position={[0, -0.08, 0.67]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.014, 10, 80]} />
        <meshStandardMaterial color="#7f1511" roughness={0.38} metalness={0.18} emissive="#240403" />
      </mesh>

      <mesh position={[0, 0.67, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.01, 10, 80]} />
        <meshBasicMaterial color="#ffcf74" transparent opacity={0.58} blending={THREE.AdditiveBlending} />
      </mesh>

      <Text
        position={[0, -0.08, 0.735]}
        rotation={[0, 0, 0]}
        fontSize={0.24}
        color="#d8a84a"
        anchorX="center"
        anchorY="middle"
      >
        籤
      </Text>
    </group>
  );
}
