export const APP_STATES = {
  IDLE: "idle",
  DRAWING: "drawing",
  REVEALED: "revealed",
  SCRATCH_MODE: "scratch-mode",
  DISINTEGRATING: "disintegrating",
  RESETTING: "resetting",
};

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

export function easeInOutCubic(t) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function stagedDrawPath(t) {
  const x = clamp(t, 0, 1);

  if (x < 0.24) {
    const p = easeInOutCubic(x / 0.24);
    return {
      phase: "awaken",
      position: [0, -0.38 + p * 0.18, -0.08],
      rotation: [0.18, 0, -0.08],
      scale: 0.08 + p * 0.09,
      glow: p,
    };
  }

  if (x < 0.58) {
    const p = easeOutCubic((x - 0.24) / 0.34);
    return {
      phase: "release",
      position: [Math.sin(p * Math.PI) * 0.42, -0.2 + p * 1.15, 0.05 + p * 0.55],
      rotation: [0.18 - p * 0.08, -0.35 * p, -0.08 + p * 0.18],
      scale: 0.17 + p * 0.2,
      glow: 1,
    };
  }

  const p = easeInOutCubic((x - 0.58) / 0.42);
  return {
    phase: "settle",
    position: [0.42 * (1 - p), 0.95 * (1 - p), 0.6 + p * 0.78],
    rotation: [0.1 * (1 - p), -0.35 * (1 - p), 0.1 * (1 - p)],
    scale: 0.37 + p * 0.62,
    glow: 1 - p * 0.55,
  };
}

