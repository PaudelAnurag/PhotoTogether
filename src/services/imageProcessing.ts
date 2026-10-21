import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { CapturedPhoto, DocumentRequirement } from '../types';

export { guideFrame, type Rect } from './cropMath';

/** Crops (source pixels) and resizes to the exact output pixels. No flip/rotate: orientation is kept as captured. */
export async function renderDocumentPhoto(
  photoUri: string,
  crop: { originX: number; originY: number; width: number; height: number },
  doc: DocumentRequirement
): Promise<CapturedPhoto> {
  const ref = await ImageManipulator.manipulate(photoUri)
    .crop(crop)
    .resize({ width: doc.outputPx.width, height: doc.outputPx.height })
    .renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 1 });
  return { uri: out.uri, width: out.width, height: out.height };
}
