import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCardTilt } from "../../hooks/useCardTilt";
import { useScratchCard } from "../../hooks/useScratchCard";
import { APP_STATES, easeInOutCubic, stagedDrawPath } from "../../utils/animation";
import { ScratchParticles } from "../scratch/ScratchParticles";

const CARD_WIDTH = 2.82;
const CARD_HEIGHT = 4.02;
const COATING_WIDTH = CARD_WIDTH * 0.9;
const COATING_HEIGHT = CARD_HEIGHT * 0.78;

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

function TiltHitZone({ position, args, handlers }) {
  return (
    <mesh
      position={position}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerLeave={handlers.onPointerLeave}
    >
      <planeGeometry args={args} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

export function ScratchCard3D({
  card,
  state,
  onDrawComplete,
  onScratchMode,
  onScratchEnd,
  onScratchProgress,
  onScratchActivity,
  audio,
}) {
  const groupRef = useRef(null);
  const coatingRef = useRef(null);
  const sealRef = useRef(null);
  const holdingTiltRef = useRef(false);
  const scratchingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const drawStartRef = useRef(null);
  const drawCompleteRef = useRef(false);
  const disintegrateStartRef = useRef(null);
  const tilt = useCardTilt();
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
      if (sealRef.current) {
        sealRef.current.material.opacity = 1;
      }

      if (t >= 1 && !drawCompleteRef.current) {
        drawCompleteRef.current = true;
        onDrawComplete?.();
      }
      return;
    }

    const rotation = tilt.step(holdingTiltRef.current ? 0.08 : 0.045);
    groupRef.current.position.set(0, 0.02 + Math.sin(elapsed * 0.75) * 0.025, 1.38);
    groupRef.current.scale.setScalar(1);
    groupRef.current.rotation.x = rotation.x;
    groupRef.current.rotation.y = rotation.y;
    groupRef.current.rotation.z = Math.sin(elapsed * 0.4) * 0.01;
    if (sealRef.current) {
      sealRef.current.material.opacity = 0;
    }

    if (state === APP_STATES.SCRATCH_MODE) {
      groupRef.current.position.z = 1.48;
      if (coatingRef.current) {
        coatingRef.current.material.emissiveIntensity = 0.18 + Math.sin(elapsed * 4) * 0.06;
      }
    }

    if (state === APP_STATES.DISINTEGRATING) {
      if (disintegrateStartRef.current === null) disintegrateStartRef.current = elapsed;
      const p = Math.min(1, (elapsed - disintegrateStartRef.current) / 1.45);
      const eased = easeInOutCubic(p);
      groupRef.current.position.x = eased * 4.8;
      groupRef.current.position.y = 0.02 + Math.sin(eased * Math.PI) * 0.28;
      groupRef.current.position.z = 1.48 - eased * 0.16;
      groupRef.current.rotation.x = rotation.x * (1 - eased * 0.4);
      groupRef.current.rotation.y = rotation.y + eased * 0.44;
      groupRef.current.rotation.z = -eased * 0.26;
      groupRef.current.scale.setScalar(1 - eased * 0.08);
      groupRef.current.traverse((object) => {
        if (object.material) {
          object.material.transparent = true;
          object.material.opacity = Math.max(0, 1 - eased * 0.92);
        }
      });
    }
  });

  const handleTiltDown = (event) => {
    event.stopPropagation();
    if (state !== APP_STATES.REVEALED) return;
    holdingTiltRef.current = true;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleTiltMove = (event) => {
    event.stopPropagation();
    if (!holdingTiltRef.current || state !== APP_STATES.REVEALED) return;
    tilt.updateFromDrag(event.clientX - dragStartRef.current.x, event.clientY - dragStartRef.current.y);
  };

  const handleTiltUp = (event) => {
    event.stopPropagation();
    holdingTiltRef.current = false;
    tilt.reset();
  };

  const handleScratchDown = (event) => {
    event.stopPropagation();
    if (state !== APP_STATES.REVEALED && state !== APP_STATES.SCRATCH_MODE) return;
    scratchingRef.current = true;
    holdingTiltRef.current = false;
    onScratchMode?.();
    if (event.uv) {
      scratchAt(event.uv);
      audio?.scratch();
    }
  };

  const handleScratchMove = (event) => {
    event.stopPropagation();
    if (!scratchingRef.current || (state !== APP_STATES.REVEALED && state !== APP_STATES.SCRATCH_MODE)) return;
    if (event.uv) {
      scratchAt(event.uv);
      audio?.scratch();
    }
  };

  const handleScratchUp = (event) => {
    event.stopPropagation();
    scratchingRef.current = false;
    endStroke();
    onScratchEnd?.();
  };

  if (!textures) return null;

  const tiltHandlers = {
    onPointerDown: handleTiltDown,
    onPointerMove: handleTiltMove,
    onPointerUp: handleTiltUp,
    onPointerLeave: (event) => {
      event.stopPropagation();
      holdingTiltRef.current = false;
      tilt.reset();
      endStroke();
    },
  };

  return (
    <group ref={groupRef} position={[0, -0.38, -0.08]} scale={0.08}>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[CARD_WIDTH + 0.08, CARD_HEIGHT + 0.08, 0.08]} />
        <meshStandardMaterial color="#25110b" roughness={0.48} metalness={0.18} />
      </mesh>

      <mesh
        position={[0, 0, 0.016]}
        {...tiltHandlers}
      >
        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT, 1, 1]} />
        <meshBasicMaterial map={textures.contentTexture} toneMapped={false} />
      </mesh>

      <TiltHitZone
        position={[-CARD_WIDTH * 0.47, 0, 0.095]}
        args={[CARD_WIDTH * 0.1, CARD_HEIGHT * 0.9]}
        handlers={tiltHandlers}
      />
      <TiltHitZone
        position={[CARD_WIDTH * 0.47, 0, 0.095]}
        args={[CARD_WIDTH * 0.1, CARD_HEIGHT * 0.9]}
        handlers={tiltHandlers}
      />
      <TiltHitZone
        position={[0, CARD_HEIGHT * 0.43, 0.095]}
        args={[CARD_WIDTH * 0.9, CARD_HEIGHT * 0.12]}
        handlers={tiltHandlers}
      />
      <TiltHitZone
        position={[0, -CARD_HEIGHT * 0.43, 0.095]}
        args={[CARD_WIDTH * 0.9, CARD_HEIGHT * 0.12]}
        handlers={tiltHandlers}
      />

      <mesh
        ref={coatingRef}
        position={[0, 0, 0.052]}
        onPointerDown={handleScratchDown}
        onPointerMove={handleScratchMove}
        onPointerUp={handleScratchUp}
        onPointerLeave={handleScratchUp}
      >
        <planeGeometry args={[COATING_WIDTH, COATING_HEIGHT, 1, 1]} />
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
        <planeGeometry args={[COATING_WIDTH, COATING_HEIGHT]} />
        <meshBasicMaterial
          color="#fff0a8"
          transparent
          opacity={state === APP_STATES.SCRATCH_MODE ? 0.13 : 0.055}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {state === APP_STATES.DRAWING && (
        <mesh ref={sealRef} position={[0, 0, 0.083]}>
          <planeGeometry args={[CARD_WIDTH * 0.96, CARD_HEIGHT * 0.94]} />
          <meshStandardMaterial
            color="#2f1309"
            roughness={0.48}
            metalness={0.18}
            emissive="#1a0703"
            emissiveIntensity={0.14}
            transparent
            opacity={1}
            depthWrite
          />
        </mesh>
      )}

      <FrameLines />
      <ScratchParticles bursts={bursts} />
    </group>
  );
}
