function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = Array.from(text);
  let line = "";
  let currentY = y;

  chars.forEach((char) => {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += lineHeight;
    } else {
      line = next;
    }
  });

  if (line) ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function drawFallbackSeal(ctx, width, height, tone = "#7b1f19") {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.strokeStyle = tone;
  ctx.lineWidth = 8;
  ctx.globalAlpha = 0.84;
  ctx.beginPath();
  ctx.arc(0, 0, Math.min(width, height) * 0.18, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i += 1) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, -Math.min(width, height) * 0.09);
    ctx.lineTo(0, -Math.min(width, height) * 0.26);
    ctx.stroke();
  }
  ctx.restore();
}

function drawImageContain(ctx, image, x, y, boxWidth, boxHeight) {
  const ratio = Math.min(boxWidth / image.naturalWidth, boxHeight / image.naturalHeight);
  const drawWidth = image.naturalWidth * ratio;
  const drawHeight = image.naturalHeight * ratio;
  ctx.drawImage(image, x + (boxWidth - drawWidth) / 2, y + (boxHeight - drawHeight) / 2, drawWidth, drawHeight);
}

export function drawCardContent(ctx, card, options = {}) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const boost = options.boost ?? 0;
  const image = options.image;
  const content = card.content;

  ctx.clearRect(0, 0, width, height);

  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#fff2cf");
  base.addColorStop(0.44, "#e9c988");
  base.addColorStop(1, "#32130e");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 70; i += 1) {
    ctx.strokeStyle = i % 3 === 0 ? "#6f1c16" : "#20110d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const y = (i / 70) * height;
    ctx.moveTo(width * 0.08, y);
    ctx.bezierCurveTo(width * 0.3, y + 18, width * 0.58, y - 18, width * 0.92, y + 8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = `rgba(255, 249, 227, ${0.42 + boost * 0.22})`;
  ctx.fillRect(width * 0.08, height * 0.08, width * 0.84, height * 0.84);
  ctx.strokeStyle = `rgba(71, 24, 16, ${0.32 + boost * 0.22})`;
  ctx.lineWidth = 8;
  ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.135, height * 0.135, width * 0.73, height * 0.73);

  ctx.fillStyle = "#5e1813";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 32px serif";
  ctx.fillText(content.eyebrow || "Oracle", width / 2, height * 0.16);

  const hasImageSlot = Boolean(content.src) || content.type === "image" || content.type === "mixed";
  const hasText = Boolean(content.text) && content.type !== "image";
  const imageSize = hasText ? width * 0.28 : width * 0.5;
  const imageY = hasText ? height * 0.34 : height * 0.34;

  if (hasImageSlot && image) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(width / 2 - imageSize / 2, imageY - imageSize / 2, imageSize, imageSize, 22);
    ctx.clip();
    drawImageContain(ctx, image, width / 2 - imageSize / 2, imageY - imageSize / 2, imageSize, imageSize);
    ctx.restore();
  } else if (hasImageSlot) {
    drawFallbackSeal(ctx, width, height, hasText ? "#8d2218" : "#422316");
  }

  if (hasText) {
    ctx.fillStyle = "#29130d";
    ctx.font = `700 ${hasImageSlot ? 39 : 54}px "Times New Roman", serif`;
    const startY = hasImageSlot ? height * 0.54 : height * 0.42;
    drawWrappedText(ctx, content.text, width / 2, startY, width * 0.66, hasImageSlot ? 52 : 72);
  }

  ctx.fillStyle = `rgba(56, 25, 13, ${0.72 + boost * 0.2})`;
  ctx.font = "500 25px serif";
  drawWrappedText(ctx, content.note || card.subtitle, width / 2, height * 0.78, width * 0.64, 34);

  ctx.fillStyle = "#6e1b14";
  ctx.font = "700 34px serif";
  ctx.fillText(card.title, width / 2, height * 0.9);
}

export function createContentCanvas(card, onUpdate) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1104;
  const ctx = canvas.getContext("2d");
  let loadedImage = null;
  let currentBoost = 0;

  const redraw = (boost = currentBoost) => {
    currentBoost = boost;
    drawCardContent(ctx, card, { boost, image: loadedImage });
    onUpdate?.();
  };

  redraw(0);

  if (card.content.src) {
    const image = new Image();
    image.onload = () => {
      loadedImage = image;
      redraw(currentBoost);
    };
    image.onerror = () => redraw(currentBoost);
    image.src = card.content.src;
  }

  return { canvas, redraw };
}
