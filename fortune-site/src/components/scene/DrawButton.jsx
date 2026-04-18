import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

export function DrawButton({ disabled, onDraw }) {
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = -2.0 + Math.sin(t * 1.2) * 0.025;
    groupRef.current.rotation.z = Math.sin(t * 0.9) * 0.015;
    groupRef.current.scale.setScalar(hovered ? 1.04 : 1);
  });

  return (
    <group
      ref={groupRef}
      position={[0, -2, 1.1]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onDraw?.();
      }}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.58, 0.66, 0.18, 72]} />
        <meshStandardMaterial color="#8d5a21" roughness={0.3} metalness={0.75} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.014, 0]}>
        <cylinderGeometry args={[0.49, 0.51, 0.045, 72]} />
        <meshStandardMaterial color={hovered ? "#f4cb73" : "#c7933e"} roughness={0.22} metalness={0.86} />
      </mesh>
      <Text position={[0, 0.13, 0.03]} fontSize={0.13} color="#1d0f07" anchorX="center" anchorY="middle">
        抽籤
      </Text>
    </group>
  );
}

