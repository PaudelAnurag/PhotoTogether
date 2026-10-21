import type { DocumentRequirement } from '../types';

export type Rect = { x: number; y: number; w: number; h: number }; // normalized 0..1

/** Framing rectangle (normalized to the camera preview) for the on-camera head-and-shoulders guide. */
export function guideFrame(doc: DocumentRequirement, previewAspect = 3 / 4): Rect {
  const aspect = doc.outputPx.width / doc.outputPx.height; // w/h
  // Fit inside 92% width / 84% height of the preview.
  let w = 0.92;
  let h = (w * previewAspect) / aspect; // normalized height
  if (h > 0.84) {
    h = 0.84;
    w = (h * aspect) / previewAspect;
  }
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

export type Box = { x: number; y: number; w: number; h: number };

/** Fit src inside box (contain): the rectangle the image occupies on screen. */
export function fitContain(src: { width: number; height: number }, box: { w: number; h: number }): Box {
  const s = Math.min(box.w / src.width, box.h / src.height);
  const w = src.width * s, h = src.height * s;
  return { x: (box.w - w) / 2, y: (box.h - h) / 2, w, h };
}

/** Clamp a crop frame (aspect locked, in image-display px relative to the image's top-left) inside the image. */
export function clampCrop(c: { x: number; y: number; w: number }, img: { w: number; h: number }, aspect: number, minW = 60) {
  const maxW = Math.min(img.w, img.h * aspect);
  const w = Math.min(Math.max(c.w, Math.min(minW, maxW)), maxW);
  const h = w / aspect;
  return { w, x: Math.min(Math.max(c.x, 0), img.w - w), y: Math.min(Math.max(c.y, 0), img.h - h) };
}

/** Display-space crop -> source-pixel crop rect (what ImageManipulator.crop wants). Aspect preserved, inside the image. */
export function toSourceCrop(c: { x: number; y: number; w: number }, img: { w: number; h: number }, src: { width: number; height: number }, aspect: number) {
  const k = src.width / img.w;
  const width = Math.min(src.width, Math.round(c.w * k));
  const height = Math.min(src.height, Math.round(width / aspect));
  return {
    originX: Math.min(Math.max(Math.round(c.x * k), 0), src.width - width),
    originY: Math.min(Math.max(Math.round(c.y * k), 0), src.height - height),
    width,
    height,
  };
}
