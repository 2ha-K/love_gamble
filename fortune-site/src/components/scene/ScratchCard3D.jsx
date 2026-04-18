import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCardTilt } from "../../hooks/useCardTilt";
import { useScratchCard } from "../../hooks/useScratchCard";
import { APP_STATES, stagedDrawPath, stagedResetPath } from "../../utils/animation";
import { ScratchParticles } from "../scratch/ScratchParticles";

const CARD_WIDTH = 2.82;
const CARD_HEIGHT = 4.02;
const COATING_WIDTH = CARD_WIDTH * 0.9;
const COATING_HEIGHT = CARD_HEIGHT * 0.78;

function CardBase() {
  return (
    <group>
      <mesh position={[0, 0, 0.014]}>
        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
        <meshStandardMaterial color="#e6d19a" roughness={0.62} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[CARD_WIDTH * 0.86, CARD_HEIGHT * 0.84]} />
        <meshBasicMaterial color="#fff0bf" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[CARD_WIDTH * 0.74, CARD_HEIGHT * 0.7]} />
        <meshBasicMaterial color="#8b2b1f" transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  );
}

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

function SpaceTiltPlane({ handlers }) {
  return (
    <mesh
      position={[0, 0, -0.18]}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerLeave={handlers.onPointerLeave}
    >
      <planeGeometry args={[9, 7]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function mapCardUvToCoatingUv(uv) {
  const x = (uv.x - (1 - COATING_WIDTH / CARD_WIDTH) / 2) / (COATING_WIDTH / CARD_WIDTH);
  const y = (uv.y - (1 - COATING_HEIGHT / CARD_HEIGHT) / 2) / (COATING_HEIGHT / CARD_HEIGHT);

  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
  };
}

function fadeMaterial(material, opacity) {
  if (material.userData.ritualBaseOpacity === undefined) {
    material.userData.ritualBaseOpacity = material.opacity ?? 1;
    material.userData.ritualBaseTransparent = material.transparent;
  }

  const effectiveOpacity = material.userData.ritualBaseOpacity * opacity;
  material.transparent = material.userData.ritualBaseTransparent || effectiveOpacity < 0.995;
  material.opacity = effectiveOpacity;

  if ("emissiveIntensity" in material) {
    material.emissiveIntensity = 0;
  }
}

export function ScratchCard3D({
  card,
  state,
  compact = false,
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
  const cardScale = compact ? 0.72 : 1;
  const cardY = compact ? -0.1 : 0.02;
  const cardZ = compact ? 1.3 : 1.38;
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

  useFrame((renderState, delta) => {
    if (!groupRef.current) return;
    const elapsed = renderState.clock.elapsedTime;

    if (state === APP_STATES.DRAWING) {
      if (drawStartRef.current === null) drawStartRef.current = elapsed;
      const t = (elapsed - drawStartRef.current) / 3.1;
      const path = stagedDrawPath(t);
      groupRef.current.position.set(...path.position);
      groupRef.current.rotation.set(...path.rotation);
      groupRef.current.scale.setScalar(path.scale * cardScale);

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

    const rotation = tilt.step(delta, holdingTiltRef.current ? 72 : 48, 12);
    groupRef.current.position.set(0, cardY + Math.sin(elapsed * 0.75) * 0.025, cardZ);
    groupRef.current.scale.setScalar(cardScale);
    groupRef.current.rotation.x = rotation.x;
    groupRef.current.rotation.y = rotation.y;
    groupRef.current.rotation.z = Math.sin(elapsed * 0.4) * 0.01;
    if (sealRef.current) {
      sealRef.current.material.opacity = 0;
    }

    if (state === APP_STATES.SCRATCH_MODE) {
      groupRef.current.position.z = compact ? 1.4 : 1.48;
      if (coatingRef.current) {
        coatingRef.current.material.emissiveIntensity = 0.18 + Math.sin(elapsed * 4) * 0.06;
      }
    }

    if (state === APP_STATES.DISINTEGRATING) {
      if (disintegrateStartRef.current === null) disintegrateStartRef.current = elapsed;
      const p = Math.min(1, (elapsed - disintegrateStartRef.current) / 1.8);
      const path = stagedResetPath(p);
      groupRef.current.position.set(path.position[0], path.position[1] + (compact ? -0.12 : 0), path.position[2]);
      groupRef.current.rotation.set(
        rotation.x + path.rotation[0],
        rotation.y + path.rotation[1],
        path.rotation[2],
      );
      groupRef.current.scale.setScalar(path.scale * cardScale);
      groupRef.current.traverse((object) => {
        if (object.material) {
          fadeMaterial(object.material, path.opacity);
        }
      });
    }
  });

  const handleTiltDown = (event) => {
    event.stopPropagation();
    if (state !== APP_STATES.REVEALED && state !== APP_STATES.SCRATCH_MODE) return;
    event.target.setPointerCapture?.(event.pointerId);
    holdingTiltRef.current = true;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleTiltMove = (event) => {
    event.stopPropagation();
    if (!holdingTiltRef.current || (state !== APP_STATES.REVEALED && state !== APP_STATES.SCRATCH_MODE)) return;
    tilt.updateFromDrag(event.clientX - dragStartRef.current.x, event.clientY - dragStartRef.current.y);
  };

  const handleTiltUp = (event) => {
    event.stopPropagation();
    event.target.releasePointerCapture?.(event.pointerId);
    holdingTiltRef.current = false;
    tilt.reset();
  };

  const handleScratchDown = (event) => {
    event.stopPropagation();
    if (state !== APP_STATES.REVEALED && state !== APP_STATES.SCRATCH_MODE) return;
    event.target.setPointerCapture?.(event.pointerId);
    scratchingRef.current = true;
    holdingTiltRef.current = false;
    onScratchMode?.();
    if (event.uv) {
      scratchAt(mapCardUvToCoatingUv(event.uv));
      audio?.scratch();
    }
  };

  const handleScratchMove = (event) => {
    event.stopPropagation();
    if (!scratchingRef.current || (state !== APP_STATES.REVEALED && state !== APP_STATES.SCRATCH_MODE)) return;
    if (event.uv) {
      scratchAt(mapCardUvToCoatingUv(event.uv));
      audio?.scratch();
    }
  };

  const handleScratchUp = (event) => {
    event.stopPropagation();
    event.target.releasePointerCapture?.(event.pointerId);
    scratchingRef.current = false;
    endStroke();
    onScratchEnd?.();
  };

  if (!textures) return null;

  const tiltHandlers = {
    onPointerDown: handleTiltDown,
    onPointerMove: handleTiltMove,
    onPointerUp: handleTiltUp,
    onPointerCancel: handleTiltUp,
    onPointerLeave: (event) => {
      event.stopPropagation();
      if (holdingTiltRef.current) return;
      holdingTiltRef.current = false;
      tilt.reset();
      endStroke();
    },
  };

  return (
    <group ref={groupRef} position={[0, -0.38, -0.08]} scale={0.08}>
      <SpaceTiltPlane handlers={tiltHandlers} />

      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[CARD_WIDTH + 0.08, CARD_HEIGHT + 0.08, 0.08]} />
        <meshStandardMaterial color="#25110b" roughness={0.48} metalness={0.18} />
      </mesh>

      <CardBase />

      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[COATING_WIDTH, COATING_HEIGHT, 1, 1]} />
        <meshBasicMaterial
          map={textures.contentTexture}
          alphaMap={textures.revealTexture}
          transparent
          alphaTest={0.04}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        position={[0, 0, 0.12]}
        onPointerDown={handleScratchDown}
        onPointerMove={handleScratchMove}
        onPointerUp={handleScratchUp}
        onPointerLeave={handleScratchUp}
      >
        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh
        ref={coatingRef}
        position={[0, 0, 0.052]}
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
