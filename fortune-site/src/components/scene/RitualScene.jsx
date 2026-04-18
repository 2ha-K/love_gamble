import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { APP_STATES } from "../../utils/animation";
import { FortuneTube } from "./FortuneTube";
import { ScratchCard3D } from "./ScratchCard3D";
import { ShrineBackground } from "./ShrineBackground";
import { LoadingOverlay } from "../ui/LoadingOverlay";

export function RitualScene({
  state,
  activeCard,
  resetKey,
  onDraw,
  onDrawComplete,
  onScratchMode,
  onScratchEnd,
  onScratchProgress,
  onScratchActivity,
  audio,
}) {
  const dpr = useMemo(() => {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return mobile ? [1, 1.5] : [1, 2];
  }, []);
  const showTube =
    state === APP_STATES.IDLE ||
    state === APP_STATES.DRAWING ||
    state === APP_STATES.DISINTEGRATING ||
    state === APP_STATES.RESETTING;
  const showCard = activeCard && state !== APP_STATES.IDLE && state !== APP_STATES.RESETTING;

  return (
    <Canvas
      className="ritual-canvas"
      style={{ position: "absolute", inset: 0, width: "100vw", height: "100svh" }}
      dpr={dpr}
      camera={{ position: [0, 0.55, 6.4], fov: 42, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#020101"]} />
      <fog attach="fog" args={["#070302", 7.5, 15]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[-3.5, 3.8, 4]} intensity={2.05} color="#ffd58a" />
      <spotLight position={[0, 3.2, 3.2]} angle={0.52} penumbra={0.7} intensity={2.4} color="#ffe0a1" />
      <pointLight position={[2.4, 1.2, 2.6]} intensity={1.45} color="#ba3d24" distance={7} />
      <pointLight position={[0, -2, 2]} intensity={0.7} color="#fff0c0" distance={5} />

      <Suspense fallback={<LoadingOverlay />}>
        <ShrineBackground />
        {showTube && (
          <FortuneTube
            drawing={state === APP_STATES.DRAWING}
            disabled={state !== APP_STATES.IDLE}
            onDraw={onDraw}
          />
        )}
        {showCard && (
          <ScratchCard3D
            key={`${activeCard.id}-${resetKey}`}
            card={activeCard}
            state={state}
            onDrawComplete={onDrawComplete}
            onScratchMode={onScratchMode}
            onScratchEnd={onScratchEnd}
            onScratchProgress={onScratchProgress}
            onScratchActivity={onScratchActivity}
            audio={audio}
          />
        )}
      </Suspense>
    </Canvas>
  );
}
