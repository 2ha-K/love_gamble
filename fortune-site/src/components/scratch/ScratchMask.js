export const SCRATCH_TEXTURE_SIZE = {
  width: 1024,
  height: 1456,
};

export function createGoldCoatingCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = SCRATCH_TEXTURE_SIZE.width;
  canvas.height = SCRATCH_TEXTURE_SIZE.height;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#6b3b08");
  base.addColorStop(0.16, "#f1bd45");
  base.addColorStop(0.38, "#fff0a4");
  base.addColorStop(0.58, "#c7831c");
  base.addColorStop(0.78, "#ffe29a");
  base.addColorStop(1, "#4a2304");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 1200; i += 1) {
    const y = Math.random() * height;
    const alpha = 0.035 + Math.random() * 0.08;
    ctx.strokeStyle = Math.random() > 0.42 ? `rgba(255,246,190,${alpha})` : `rgba(54,22,4,${alpha})`;
    ctx.lineWidth = Math.random() * 1.2 + 0.22;
    ctx.beginPath();
    ctx.moveTo(-80, y);
    ctx.lineTo(width + 80, y + (Math.random() - 0.5) * 22);
    ctx.stroke();
  }

  const glow = ctx.createRadialGradient(width * 0.32, height * 0.18, 0, width * 0.32, height * 0.18, width * 0.58);
  glow.addColorStop(0, "rgba(255,255,216,0.72)");
  glow.addColorStop(0.28, "rgba(255,213,105,0.2)");
  glow.addColorStop(1, "rgba(255,213,105,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,246,196,0.84)";
  ctx.font = "700 62px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("命", width * 0.5, height * 0.46);

  ctx.strokeStyle = "rgba(255,244,190,0.58)";
  ctx.lineWidth = 7;
  ctx.strokeRect(width * 0.045, height * 0.045, width * 0.91, height * 0.91);
  ctx.strokeStyle = "rgba(65,28,4,0.22)";
  ctx.lineWidth = 3;
  ctx.strokeRect(width * 0.08, height * 0.08, width * 0.84, height * 0.84);

  return canvas;
}

export function createMaskCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = SCRATCH_TEXTURE_SIZE.width;
  canvas.height = SCRATCH_TEXTURE_SIZE.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

export function createRevealCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = SCRATCH_TEXTURE_SIZE.width;
  canvas.height = SCRATCH_TEXTURE_SIZE.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

function scratchLine(ctx, from, to, width, alpha, jitter, slices, color) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / length;
  const ny = dx / length;

  for (let i = 0; i < slices; i += 1) {
    const offset = (Math.random() - 0.5) * jitter;
    const gap = Math.random() * 0.08;
    const start = gap;
    const end = 1 - Math.random() * 0.1;

    ctx.strokeStyle = `rgba(${color},${alpha * (0.42 + Math.random() * 0.58)})`;
    ctx.lineWidth = width * (0.3 + Math.random() * 0.72);
    ctx.lineCap = Math.random() > 0.55 ? "round" : "butt";
    ctx.beginPath();
    ctx.moveTo(from.x + dx * start + nx * offset, from.y + dy * start + ny * offset);
    ctx.lineTo(to.x + dx * end + nx * (offset + (Math.random() - 0.5) * 10), to.y + dy * end + ny * offset);
    ctx.stroke();
  }
}

export function applyDirectionalScratch(ctx, from, to, velocity = 1, color = "0,0,0") {
  const speed = Math.max(0.7, Math.min(2.6, velocity));
  const radius = 30 + speed * 10;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  scratchLine(ctx, from, to, radius, 0.68, radius * 1.25, 7, color);
  scratchLine(ctx, from, to, radius * 0.42, 0.88, radius * 0.58, 8, color);

  for (let i = 0; i < 18; i += 1) {
    const t = Math.random();
    const x = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * radius * 1.2;
    const y = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * radius * 1.2;
    ctx.fillStyle = `rgba(${color},${0.18 + Math.random() * 0.28})`;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.random() * 5 + 2, Math.random() * 1.8 + 0.8, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function calculateScratchPercent(canvas) {
  const ctx = canvas.getContext("2d");
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let removed = 0;
  let total = 0;

  for (let i = 0; i < data.length; i += 96) {
    removed += 1 - data[i] / 255;
    total += 1;
  }

  return Math.round((removed / total) * 100);
}
