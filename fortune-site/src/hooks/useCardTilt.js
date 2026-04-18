import { useCallback, useRef } from "react";
import { clamp } from "../utils/animation";

export function useCardTilt() {
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  const updateFromUv = useCallback((uv) => {
    if (!uv) return;
    targetRef.current.y = clamp((uv.x - 0.5) * 0.42, -0.18, 0.18);
    targetRef.current.x = clamp(-(uv.y - 0.5) * 0.32, -0.14, 0.14);
  }, []);

  const updateFromDrag = useCallback((deltaX, deltaY) => {
    targetRef.current.y = clamp(deltaX * 0.0032, -0.22, 0.22);
    targetRef.current.x = clamp(deltaY * 0.0024, -0.15, 0.15);
  }, []);

  const reset = useCallback(() => {
    targetRef.current.x = 0;
    targetRef.current.y = 0;
  }, []);

  const step = useCallback((delta = 1 / 60, stiffness = 58, damping = 13) => {
    const dt = Math.min(delta, 0.033);
    const forceX = (targetRef.current.x - currentRef.current.x) * stiffness;
    const forceY = (targetRef.current.y - currentRef.current.y) * stiffness;

    velocityRef.current.x = (velocityRef.current.x + forceX * dt) * Math.exp(-damping * dt);
    velocityRef.current.y = (velocityRef.current.y + forceY * dt) * Math.exp(-damping * dt);
    currentRef.current.x += velocityRef.current.x * dt;
    currentRef.current.y += velocityRef.current.y * dt;

    return currentRef.current;
  }, []);

  return { updateFromUv, updateFromDrag, reset, step };
}
