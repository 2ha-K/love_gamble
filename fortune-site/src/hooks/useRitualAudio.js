import { useCallback, useRef } from "react";

export function useRitualAudio() {
  const contextRef = useRef(null);

  const getContext = useCallback(() => {
    if (!contextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      contextRef.current = new AudioContext();
    }
    if (contextRef.current.state === "suspended") {
      contextRef.current.resume();
    }
    return contextRef.current;
  }, []);

  const tone = useCallback((frequency, duration, gain = 0.045, type = "sine") => {
    const context = getContext();
    if (!context) return;

    const osc = context.createOscillator();
    const amp = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, context.currentTime);
    amp.gain.setValueAtTime(0, context.currentTime);
    amp.gain.linearRampToValueAtTime(gain, context.currentTime + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    osc.connect(amp);
    amp.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + duration + 0.02);
  }, [getContext]);

  return {
    draw: () => {
      tone(96, 0.55, 0.055, "sine");
      window.setTimeout(() => tone(168, 0.36, 0.032, "triangle"), 230);
    },
    scratchReady: () => tone(420, 0.16, 0.025, "triangle"),
    scratch: () => tone(1300 + Math.random() * 500, 0.035, 0.006, "sawtooth"),
    ash: () => {
      tone(72, 0.72, 0.05, "sine");
      window.setTimeout(() => tone(230, 0.28, 0.018, "triangle"), 180);
    },
  };
}

