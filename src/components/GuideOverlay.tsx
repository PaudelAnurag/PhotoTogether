import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { DocumentRequirement } from '../types';
import { guideFrame } from '../services/cropMath';

const pct = (n: number) => `${n * 100}%` as const;

/**
 * Manual framing guide: dimmed surround, document-shaped frame, head and shoulders outline.
 * Head size uses the verified range when one exists; otherwise a generic size (documented in the requirements UI).
 */
export function GuideOverlay({ doc, tone }: { doc: DocumentRequirement; tone: string }) {
  const [box, setBox] = useState<{ w: number; h: number }>();
  const frame = box ? guideFrame(doc, box.w / box.h) : undefined; // follows the actual screen shape
  const headH = doc.headRatio ? (doc.headRatio.min + doc.headRatio.max) / 2 : 0.55; // fraction of frame height
  const headTop = 0.1;
  const aspect = doc.outputPx.width / doc.outputPx.height; // frame width / height in px
  const headW = Math.min(0.8, (headH * 0.75) / aspect); // a head is ~0.75x as wide as it is tall
  const shoulderTop = headTop + headH - 0.02; // shoulders start just under the chin
  const dim = 'rgba(0,0,0,0.45)';
  return (
    <View style={StyleSheet.absoluteFill} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {frame ? (
        <>
      <View style={[styles.abs, { left: 0, right: 0, top: 0, height: pct(frame.y), backgroundColor: dim }]} />
      <View style={[styles.abs, { left: 0, right: 0, top: pct(frame.y + frame.h), bottom: 0, backgroundColor: dim }]} />
      <View style={[styles.abs, { left: 0, width: pct(frame.x), top: pct(frame.y), height: pct(frame.h), backgroundColor: dim }]} />
      <View style={[styles.abs, { right: 0, width: pct(frame.x), top: pct(frame.y), height: pct(frame.h), backgroundColor: dim }]} />
      <View
        style={[styles.abs, { left: pct(frame.x), top: pct(frame.y), width: pct(frame.w), height: pct(frame.h), borderWidth: 2, borderColor: tone, borderRadius: 8, overflow: 'hidden' }]}
      >
        <View
          style={[styles.abs, { left: pct((1 - headW) / 2), width: pct(headW), top: pct(headTop), height: pct(headH), borderWidth: 3, borderColor: tone, borderRadius: 999 }]}
        />
        <View
          style={[styles.abs, { left: '5%', right: '5%', top: pct(shoulderTop), height: '90%', borderWidth: 3, borderColor: tone, borderTopLeftRadius: 999, borderTopRightRadius: 999 }]}
        />
      </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ abs: { position: 'absolute' } });
