import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCardTilt } from "../../hooks/useCardTilt";
import { usePressMode } from "../../hooks/usePressMode";
import { useScratchCard } from "../../hooks/useScratchCard";
import { APP_STATES, easeInOutCubic, stagedDrawPath } from "../../utils/animation";
import { AshParticles, ScratchParticles } from "../scratch/ScratchParticles";

const CARD_WIDTH = 2.82;
const CARD_HEIGHT = 4.02;

function FrameLines() {
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ad7931",
    roughness: 0.24,
    metalness: 0.82,
  }), []);

  useEffect(() => () => material.dispose(), [material]);

  return (
    <group position={[0, 0, 0.076]}>
      <mesh position={[0, CARD_HEIGHT / 2 - 0.055, 0]}>
        <boxGeometry args={[CARD_WIDTH, 0.05, 0.035]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0, -CARD_HEIGHT / 2 + 0.055, 0]}>
        <boxGeometry args={[CARD_WIDTH, 0.05, 0.035]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-CARD_WIDTH / 2 + 0.055, 0, 0]}>
        <boxGeometry args={[0.05, CARD_HEIGHT, 0.035]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[CARD_WIDTH / 2 - 0.055, 0, 0]}>
        <boxGeometry args={[0.05, CARD_HEIGHT, 0.035]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

export function ScratchCard3D({
  card,
  state,
  onDrawComplete,
  onScratchMode,
  onScratchProgress,
  onScratchActivity,
  audio,
}) {
  const groupRef = useRef(null);
  const coatingRef = useRef(null);
  const drawStartRef = useRef(null);
  const drawCompleteRef = useRef(false);
  const disintegrateStartRef = useRef(null);
  const tilt = useCardTilt();
  const press = usePressMode({ delay: 450, onLongPress: onScratchMode });
  const { textures, bursts, scratchAt, endStroke } = useScratchCard(card, {
    onProgress: onScratchProgress,
    onScratchActivity,
  });

  useEffect(() => {
    if (state === APP_STATES.DRAWING) {
      drawStartRef.current = null;
      drawCompleteRef.current = false;
    }
    if (state === APP_STATES.DISINTEGRATING) {
      disintegrateStartRef.current = null;
    }
  }, [state]);

  useFrame((renderState) => {
    if (!groupRef.current) return;
    const elapsed = renderState.clock.elapsedTime;

    if (state === APP_STATES.DRAWING) {
      if (drawStartRef.current === null) drawStartRef.current = elapsed;
      const t = (elapsed - drawStartRef.current) / 3.1;
      const path = stagedDrawPath(t);
      groupRef.current.position.set(...path.position);
      groupRef.current.rotation.set(...path.rotation);
      groupRef.current.scale.setScalar(path.scale);

      if (coatingRef.current) {
        coatingRef.current.material.emissiveIntensity = 0.08 + path.glow * 0.28;
      }

      if (t >= 1 && !drawCompleteRef.current) {
        drawCompleteRef.current = true;
        onDrawComplete?.();
      }
      return;
    }

    const rotation = tilt.step(state === APP_STATES.SCRATCH_MODE ? 0.045 : 0.08);
    groupRef.current.position.set(0, 0.02 + Math.sin(elapsed * 0.75) * 0.025, 1.38);
    groupRef.current.scale.setScalar(1);
    groupRef.current.rotation.x = rotation.x;
    groupRef.current.rotation.y = rotation.y;
    groupRef.current.rotation.z = Math.sin(elapsed * 0.4) * 0.01;

    if (state === APP_STATES.SCRATCH_MODE) {
      groupRef.current.position.z = 1.48;
      if (coatingRef.current) {
        coatingRef.current.material.emissiveIntensity = 0.18 + Math.sin(elapsed * 4) * 0.06;
      }
    }

    if (state === APP_STATES.DISINTEGRATING) {
      if (disintegrateStartRef.current === null) disintegrateStartRef.current = elapsed;
      const p = Math.min(1, (elapsed - disintegrateStartRef.current) / 2.1);
      const shake = Math.sin(elapsed * 64) * (1 - p) * 0.035;
      groupRef.current.position.x = shake;
      groupRef.current.position.y = -p * 0.3 + Math.sin(elapsed * 24) * (1 - p) * 0.03;
      groupRef.current.rotation.z = shake * 0.4;
      groupRef.current.scale.setScalar(1 - easeInOutCubic(p) * 0.18);
      groupRef.current.traverse((object) => {
        if (object.material) {
          object.material.transparent = true;
          object.material.opacity = Math.max(0, 1 - p * 1.15);
        }
      });
    }
  });

  const handlePointerDown = (event) => {
    event.stopPropagation();
    if (state === APP_STATES.REVEALED) press.start();
    if (state === APP_STATES.SCRATCH_MODE && event.uv) {
      scratchAt(event.uv);
      audio?.scratch();
    }
  };

  const handlePointerMove = (event) => {
    event.stopPropagation();
    if (state === APP_STATES.REVEALED) tilt.updateFromUv(event.uv);
    if (state === APP_STATES.SCRATCH_MODE && event.uv) {
      scratchAt(event.uv);
      audio?.scratch();
    }
  };

  const handlePointerUp = (event) => {
    event.stopPropagation();
    press.end();
    endStroke();
  };

  if (!textures) return null;

  return (
    <group ref={groupRef} position={[0, -0.38, -0.08]} scale={0.08}>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[CARD_WIDTH + 0.08, CARD_HEIGHT + 0.08, 0.08]} />
        <meshStandardMaterial color="#25110b" roughness={0.48} metalness={0.18} />
      </mesh>

      <mesh
        position={[0, 0, 0.016]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={(event) => {
          event.stopPropagation();
          tilt.reset();
          press.end();
          endStroke();
        }}
      >
        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT, 1, 1]} />
        <meshBasicMaterial map={textures.contentTexture} toneMapped={false} />
      </mesh>

      <mesh
        ref={coatingRef}
        position={[0, 0, 0.052]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <planeGeometry args={[CARD_WIDTH * 0.9, CARD_HEIGHT * 0.74, 1, 1]} />
        <meshStandardMaterial
          map={textures.coatingTexture}
          alphaMap={textures.maskTexture}
          color="#d7a642"
          roughness={0.22}
          metalness={0.86}
          emissive="#5c3509"
          emissiveIntensity={0.09}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.061]}>
        <planeGeometry args={[CARD_WIDTH * 0.9, CARD_HEIGHT * 0.74]} />
        <meshBasicMaterial
          color="#fff0a8"
          transparent
          opacity={state === APP_STATES.SCRATCH_MODE ? 0.13 : 0.055}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <FrameLines />
      <ScratchParticles bursts={bursts} />
      <AshParticles active={state === APP_STATES.DISINTEGRATING} />
    </group>
  );
}

