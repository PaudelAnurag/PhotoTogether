import type { DocumentRequirement } from '../types';
import type { Rect } from './imageProcessing';

export type FaceCheck =
  | { status: 'unavailable'; messages: string[] }
  | { status: 'no-face' | 'multiple' | 'adjust' | 'ok'; messages: string[] };

type MlFace = { frame: { left: number; top: number; width: number; height: number } };

/**
 * Face check on a captured STILL (not live). Needs the ML Kit native module, i.e. a development build;
 * in Expo Go the module is absent and we report 'unavailable' instead of pretending to validate.
 */
export async function checkFace(
  uri: string,
  src: { width: number; height: number },
  frame: Rect,
  doc: DocumentRequirement
): Promise<FaceCheck> {
  let faces: MlFace[];
  try {
    const FaceDetection = require('@react-native-ml-kit/face-detection').default;
    faces = await FaceDetection.detect(uri, { performanceMode: 'accurate' });
  } catch {
    return {
      status: 'unavailable',
      messages: ['Automatic face check needs a development build. Use the outline and the rules above to check this photo yourself.'],
    };
  }
  if (faces.length === 0) return { status: 'no-face', messages: ['No face detected. Retake with your face fully visible.'] };
  if (faces.length > 1) return { status: 'multiple', messages: ['More than one face detected. Only one person should be in the photo.'] };

  const f = faces[0].frame;
  const fx = frame.x * src.width, fy = frame.y * src.height, fw = frame.w * src.width, fh = frame.h * src.height;
  const messages: string[] = [];
  const dx = (f.left + f.width / 2 - (fx + fw / 2)) / fw;
  if (f.left < fx || f.top < fy || f.left + f.width > fx + fw || f.top + f.height > fy + fh) messages.push('Part of your face is outside the frame.');
  else if (Math.abs(dx) > 0.1) messages.push('Center your head.');

  if (doc.headRatio) {
    const ratio = f.height / fh;
    // shortcut: ML Kit's box covers roughly forehead-to-chin, smaller than the chin-to-crown the rules measure.
    // So only flag when it is unambiguous (box < 60% of min, or box already above max); upgrade with landmarks/contours.
    if (ratio < doc.headRatio.min * 0.6) messages.push('Move a little closer.');
    else if (ratio > doc.headRatio.max) messages.push('Move a little farther away.');
  }
  return messages.length
    ? { status: 'adjust', messages }
    : { status: 'ok', messages: ['A face was found, centered and inside the frame. Size and eye position are not measured precisely — check the rules.'] };
}
