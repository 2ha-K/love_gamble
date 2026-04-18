import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  applyDirectionalScratch,
  calculateScratchPercent,
  createGoldCoatingCanvas,
  createMaskCanvas,
  createRevealCanvas,
} from "../components/scratch/ScratchMask";
import { createContentCanvas } from "../utils/cardContentRenderer";

export function useScratchCard(card, { onProgress, onScratchActivity } = {}) {
  const maskCanvasRef = useRef(null);
  const lastPointRef = useRef(null);
  const lastTimeRef = useRef(0);
  const lastProgressCheckRef = useRef(0);
  const lastParticleEmitRef = useRef(0);
  const textureRefs = useRef({
    maskTexture: null,
    revealTexture: null,
    revealCanvas: null,
    contentTexture: null,
    redrawContent: null,
  });
  const [bursts, setBursts] = useState([]);

  const textures = useMemo(() => {
    const maskCanvas = createMaskCanvas();
    const revealCanvas = createRevealCanvas();
    const coatingCanvas = createGoldCoatingCanvas();
    let contentTexture;
    const content = createContentCanvas(card, () => {
      if (contentTexture) contentTexture.needsUpdate = true;
    });

    const maskTexture = new THREE.CanvasTexture(maskCanvas);
    const revealTexture = new THREE.CanvasTexture(revealCanvas);
    const coatingTexture = new THREE.CanvasTexture(coatingCanvas);
    contentTexture = new THREE.CanvasTexture(content.canvas);
    maskTexture.colorSpace = THREE.NoColorSpace;
    revealTexture.colorSpace = THREE.NoColorSpace;
    coatingTexture.colorSpace = THREE.SRGBColorSpace;
    contentTexture.colorSpace = THREE.SRGBColorSpace;
    coatingTexture.anisotropy = 8;
    contentTexture.anisotropy = 8;

    const redrawContent = (boost) => {
      content.redraw(boost);
      contentTexture.needsUpdate = true;
    };

    return { maskCanvas, revealCanvas, maskTexture, revealTexture, coatingTexture, contentTexture, redrawContent };
  }, [card]);

  useEffect(() => {
    const refs = textureRefs.current;
    maskCanvasRef.current = textures.maskCanvas;
    refs.maskTexture = textures.maskTexture;
    refs.revealTexture = textures.revealTexture;
    refs.revealCanvas = textures.revealCanvas;
    refs.contentTexture = textures.contentTexture;
    refs.redrawContent = textures.redrawContent;
    onProgress?.(0);

    return () => {
      textures.maskTexture.dispose();
      textures.revealTexture.dispose();
      textures.coatingTexture.dispose();
      textures.contentTexture.dispose();
      refs.maskTexture = null;
      refs.revealTexture = null;
      refs.revealCanvas = null;
      refs.contentTexture = null;
      refs.redrawContent = null;
    };
  }, [onProgress, textures]);

  const scratchAt = useCallback((uv) => {
    const maskTexture = textureRefs.current.maskTexture;
    const revealTexture = textureRefs.current.revealTexture;
    const revealCanvas = textureRefs.current.revealCanvas;
    const contentTexture = textureRefs.current.contentTexture;
    const redrawContent = textureRefs.current.redrawContent;
    if (!uv || !maskCanvasRef.current || !revealCanvas || !maskTexture || !revealTexture || !contentTexture) return;

    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const revealCtx = revealCanvas.getContext("2d");
    const now = performance.now();
    const point = {
      x: uv.x * canvas.width,
      y: (1 - uv.y) * canvas.height,
    };
    const prev = lastPointRef.current || point;
    const distance = Math.hypot(point.x - prev.x, point.y - prev.y);
    const delta = Math.max(16, now - (lastTimeRef.current || now));
    const velocity = Math.min(3, Math.max(0.7, distance / delta));

    applyDirectionalScratch(ctx, prev, point, velocity, "0,0,0");
    applyDirectionalScratch(revealCtx, prev, point, velocity, "255,255,255");
    maskTexture.needsUpdate = true;
    revealTexture.needsUpdate = true;
    lastPointRef.current = point;
    lastTimeRef.current = now;

    if (now - lastParticleEmitRef.current > 28) {
      const angle = Math.atan2(point.y - prev.y, point.x - prev.x) || -Math.PI / 2;
      setBursts((items) => [
        ...items.slice(-20),
        {
          id: `${now}-${Math.random()}`,
          x: (uv.x - 0.5) * 2.82,
          y: (uv.y - 0.5) * 4.02,
          angle,
          strength: 0.7 + velocity,
        },
      ]);
      lastParticleEmitRef.current = now;
    }

    if (now - lastProgressCheckRef.current > 120) {
      const percent = calculateScratchPercent(canvas);
      onProgress?.(percent);
      redrawContent?.(percent >= 50 ? 1 : percent / 60);
      contentTexture.needsUpdate = true;
      lastProgressCheckRef.current = now;
    }

    onScratchActivity?.();
  }, [onProgress, onScratchActivity]);

  const endStroke = useCallback(() => {
    lastPointRef.current = null;
    lastTimeRef.current = 0;
  }, []);

  return {
    textures,
    bursts,
    scratchAt,
    endStroke,
  };
}
