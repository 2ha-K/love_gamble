import { useCallback, useRef } from "react";
import { clamp, lerp } from "../utils/animation";

export function useCardTilt() {
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const updateFromUv = useCallback((uv) => {
    if (!uv) return;
    targetRef.current.y = clamp((uv.x - 0.5) * 0.42, -0.18, 0.18);
    targetRef.current.x = clamp(-(uv.y - 0.5) * 0.32, -0.14, 0.14);
  }, []);

  const updateFromDrag = useCallback((deltaX, deltaY) => {
    targetRef.current.y = clamp(deltaX * 0.004, -0.26, 0.26);
    targetRef.current.x = clamp(-deltaY * 0.003, -0.18, 0.18);
  }, []);

  const reset = useCallback(() => {
    targetRef.current.x = 0;
    targetRef.current.y = 0;
  }, []);

  const step = useCallback((speed = 0.09) => {
    currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, speed);
    currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, speed);
    return currentRef.current;
  }, []);

  return { updateFromUv, updateFromDrag, reset, step };
}
