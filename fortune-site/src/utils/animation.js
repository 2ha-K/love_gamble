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

  if (x < 0.18) {
    const p = easeInOutCubic(x / 0.18);
    return {
      phase: "awaken",
      position: [0, -0.42 + p * 0.08, -0.1],
      rotation: [0.22, 0, -0.05],
      scale: 0.08 + p * 0.04,
      glow: p,
      cover: 1,
    };
  }

  if (x < 0.36) {
    const p = easeOutCubic((x - 0.18) / 0.18);
    return {
      phase: "rise",
      position: [0.08 * Math.sin(p * Math.PI), -0.34 + p * 0.82, -0.04 + p * 0.2],
      rotation: [0.22 - p * 0.08, -0.12 * p, -0.05 + p * 0.04],
      scale: 0.12 + p * 0.15,
      glow: 1,
      cover: 1,
    };
  }

  if (x < 0.62) {
    const p = easeInOutCubic((x - 0.36) / 0.26);
    return {
      phase: "leave-tube",
      position: [Math.sin(p * Math.PI) * 0.42, 0.48 + p * 0.52, 0.16 + p * 0.58],
      rotation: [0.14 - p * 0.16, -0.12 - 0.42 * p, -0.01 + p * 0.14],
      scale: 0.27 + p * 0.24,
      glow: 1,
      cover: 1,
    };
  }

  if (x < 0.82) {
    const p = easeInOutCubic((x - 0.62) / 0.2);
    return {
      phase: "face-camera",
      position: [0.42 * (1 - p), 1.0 - p * 0.36, 0.74 + p * 0.44],
      rotation: [-0.02 * (1 - p), -0.54 * (1 - p), 0.13 * (1 - p)],
      scale: 0.51 + p * 0.35,
      glow: 1 - p * 0.22,
      cover: 1,
    };
  }

  const p = easeInOutCubic((x - 0.82) / 0.18);
  return {
    phase: "settle",
    position: [0, 0.64 * (1 - p), 1.18 + p * 0.2],
    rotation: [0, 0, 0],
    scale: 0.86 + p * 0.14,
    glow: 0.78 - p * 0.18,
    cover: 1,
  };
}

export function stagedResetPath(t) {
  const x = clamp(t, 0, 1);

  if (x < 0.18) {
    const p = easeInOutCubic(x / 0.18);
    return {
      position: [-0.08 * p, 0.02 + p * 0.04, 1.48 + p * 0.06],
      rotation: [0, -0.08 * p, 0.04 * p],
      scale: 1 - p * 0.025,
      opacity: 1,
      glow: 0.22,
    };
  }

  const p = easeInOutCubic((x - 0.18) / 0.82);
  const fade = p < 0.72 ? 1 : Math.max(0, 1 - easeInOutCubic((p - 0.72) / 0.28));

  return {
    position: [-0.08 + p * 5.4, 0.06 + Math.sin(p * Math.PI) * 0.34, 1.54 - p * 0.18],
    rotation: [0.04 * (1 - p), -0.08 + p * 0.62, -p * 0.32],
    scale: 0.975 - p * 0.06,
    opacity: fade,
    glow: 0.22 * (1 - p),
  };
}
