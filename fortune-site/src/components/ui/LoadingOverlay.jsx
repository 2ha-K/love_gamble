import { Html, useProgress } from "@react-three/drei";

export function LoadingOverlay() {
  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <Html center className="loading-overlay">
      <div>
        <span>凝光中</span>
        <strong>{Math.round(progress)}%</strong>
      </div>
    </Html>
  );
}

