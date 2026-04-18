import { useCallback, useRef } from "react";

export function usePressMode({ delay = 450, onLongPress }) {
  const timerRef = useRef(null);
  const triggeredRef = useRef(false);

  const clear = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const start = useCallback(() => {
    clear();
    triggeredRef.current = false;
    timerRef.current = window.setTimeout(() => {
      triggeredRef.current = true;
      onLongPress?.();
    }, delay);
  }, [clear, delay, onLongPress]);

  const end = useCallback(() => {
    clear();
    return triggeredRef.current;
  }, [clear]);

  return { start, end, cancel: clear };
}

