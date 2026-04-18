import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createParticlePool, spawnAsh, spawnScratchDust, updateParticlePool } from "../../utils/particles";

export function ScratchParticles({ bursts }) {
  const pointsRef = useRef(null);
  const pool = useMemo(() => createParticlePool(180), []);

  useEffect(() => {
    bursts.forEach((burst) => {
      spawnScratchDust(pool, [burst.x, burst.y, 0.11], burst.angle, burst.strength, 7);
    });
  }, [bursts, pool]);

  useFrame((_, delta) => {
    updateParticlePool(pool, delta, 0.05);
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pool.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f4ca72"
        size={0.032}
        transparent
        opacity={0.82}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function AshParticles({ active }) {
  const pointsRef = useRef(null);
  const emittedRef = useRef(false);
  const pool = useMemo(() => createParticlePool(280), []);

  useEffect(() => {
    if (active && !emittedRef.current) {
      spawnAsh(pool, 260);
      emittedRef.current = true;
    }
    if (!active) emittedRef.current = false;
  }, [active, pool]);

  useFrame((_, delta) => {
    updateParticlePool(pool, delta, 0.62);
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pool.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#a89b88" size={0.038} transparent opacity={0.72} depthWrite={false} />
    </points>
  );
}

