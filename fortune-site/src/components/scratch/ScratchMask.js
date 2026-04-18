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
  base.addColorStop(0, "#4b2607");
  base.addColorStop(0.18, "#d49b28");
  base.addColorStop(0.42, "#fff2aa");
  base.addColorStop(0.68, "#a26010");
  base.addColorStop(1, "#2b1304");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 900; i += 1) {
    const y = Math.random() * height;
    const alpha = 0.025 + Math.random() * 0.055;
    ctx.strokeStyle = Math.random() > 0.46 ? `rgba(255,246,190,${alpha})` : `rgba(65,31,5,${alpha})`;
    ctx.lineWidth = Math.random() * 1.6 + 0.3;
    ctx.beginPath();
    ctx.moveTo(-80, y);
    ctx.lineTo(width + 80, y + (Math.random() - 0.5) * 32);
    ctx.stroke();
  }

  const glow = ctx.createRadialGradient(width * 0.24, height * 0.18, 0, width * 0.24, height * 0.18, width * 0.58);
  glow.addColorStop(0, "rgba(255,255,216,0.5)");
  glow.addColorStop(0.28, "rgba(255,213,105,0.12)");
  glow.addColorStop(1, "rgba(255,213,105,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,246,196,0.72)";
  ctx.font = "700 62px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("命", width * 0.5, height * 0.46);

  ctx.strokeStyle = "rgba(255,244,190,0.45)";
  ctx.lineWidth = 5;
  ctx.strokeRect(width * 0.09, height * 0.08, width * 0.82, height * 0.84);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width * 0.13, height * 0.12, width * 0.74, height * 0.76);

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

function scratchLine(ctx, from, to, width, alpha, jitter, slices) {
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

    ctx.strokeStyle = `rgba(0,0,0,${alpha * (0.42 + Math.random() * 0.58)})`;
    ctx.lineWidth = width * (0.3 + Math.random() * 0.72);
    ctx.lineCap = Math.random() > 0.55 ? "round" : "butt";
    ctx.beginPath();
    ctx.moveTo(from.x + dx * start + nx * offset, from.y + dy * start + ny * offset);
    ctx.lineTo(to.x + dx * end + nx * (offset + (Math.random() - 0.5) * 10), to.y + dy * end + ny * offset);
    ctx.stroke();
  }
}

export function applyDirectionalScratch(ctx, from, to, velocity = 1) {
  const speed = Math.max(0.7, Math.min(2.6, velocity));
  const radius = 30 + speed * 10;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  scratchLine(ctx, from, to, radius, 0.68, radius * 1.25, 7);
  scratchLine(ctx, from, to, radius * 0.42, 0.88, radius * 0.58, 8);

  for (let i = 0; i < 18; i += 1) {
    const t = Math.random();
    const x = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * radius * 1.2;
    const y = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * radius * 1.2;
    ctx.fillStyle = `rgba(0,0,0,${0.18 + Math.random() * 0.28})`;
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

