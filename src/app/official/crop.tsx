import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { PanResponder, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { Button, Notice, P, Screen } from '../../components/ui';
import { findDocument } from '../../data/documentRequirements';
import { clampCrop, fitContain, toSourceCrop } from '../../services/cropMath';
import { renderDocumentPhoto } from '../../services/imageProcessing';
import { officialStorage } from '../../services/tempStorage';
import { colors, space } from '../../theme';

type Crop = { x: number; y: number; w: number }; // image-display px, relative to the image's top-left; h = w / aspect
const HANDLE = 44;

export default function OfficialCrop() {
  const p = useLocalSearchParams<{ country: string; doc: string; uri: string; w: string; h: string }>();
  const doc = findDocument(p.country, p.doc);
  const src = useMemo(() => ({ uri: p.uri, width: Number(p.w), height: Number(p.h) }), [p.uri, p.w, p.h]);
  const valid = !!doc && !!p.uri && src.width > 0 && src.height > 0;
  const aspect = doc ? doc.outputPx.width / doc.outputPx.height : 1;

  const [area, setArea] = useState<{ w: number; h: number }>();
  const img = useMemo(() => (valid && area ? fitContain(src, area) : undefined), [valid, area, src]);
  const [crop, setCrop] = useState<Crop>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  // Visible crop, computed during render so the frame is valid and inside the image on the very first paint
  // (and after any re-measure), without waiting for the effect below.
  const initial = img && { w: Math.min(img.w * 0.8, img.h * 0.8 * aspect), x: 0, y: 0 };
  if (img && initial) {
    initial.x = (img.w - initial.w) / 2;
    initial.y = (img.h - initial.w / aspect) / 2;
  }
  const view = img && crop ? clampCrop(crop, img, aspect) : initial;
  const insets = useSafeAreaInsets();

  const cropRef = useRef(view);
  cropRef.current = view;
  const imgRef = useRef(img);
  imgRef.current = img;
  const start = useRef<Crop>({ x: 0, y: 0, w: 0 });

  // Default frame: 80% of the image, locked to the document's aspect, centered. If the image area is re-measured
  // (header/bar height changes, rotation), scale the frame with it so it always stays inside the image.
  const prevImg = useRef(img);
  useEffect(() => {
    if (!img) return;
    const prev = prevImg.current;
    prevImg.current = img;
    setCrop((c) => {
      if (!c || !prev) {
        const w = Math.min(img.w * 0.8, img.h * 0.8 * aspect);
        return { x: (img.w - w) / 2, y: (img.h - w / aspect) / 2, w };
      }
      if (prev.w === img.w && prev.h === img.h) return c;
      return clampCrop({ x: (c.x * img.w) / prev.w, y: (c.y * img.h) / prev.h, w: (c.w * img.w) / prev.w }, img, aspect);
    });
  }, [img, aspect]);

  // Only Retake (or moving on to the result) may leave: header arrow and swipe are disabled in _layout, OS/hardware back is blocked here.
  const canLeave = useRef(false);
  useFocusEffect(
    useCallback(() => {
      canLeave.current = false;
      return () => {
        canLeave.current = true; // blurred because we pushed the result screen
      };
    }, [])
  );
  const navigation = useNavigation<{ addListener(type: 'beforeRemove', cb: (e: { preventDefault(): void }) => void): () => void }>();
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (!canLeave.current) return e.preventDefault();
        void officialStorage.remove(src.uri); // leaving for good: delete the captured file
      }),
    [navigation, src.uri]
  );
  const retake = () => {
    canLeave.current = true;
    router.back();
  };

  const [mover, resizer] = useMemo(() => {
    const make = (resize: boolean) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          if (cropRef.current) start.current = cropRef.current;
        },
        onPanResponderMove: (_, g) => {
          const i = imgRef.current, s = start.current;
          if (!i) return;
          if (resize) {
            const w = Math.min(s.w + g.dx, i.w - s.x, (i.h - s.y) * aspect); // grow from the top-left corner, never past the image
            setCrop(clampCrop({ x: s.x, y: s.y, w }, i, aspect));
          } else {
            setCrop(clampCrop({ x: s.x + g.dx, y: s.y + g.dy, w: s.w }, i, aspect));
          }
        },
      });
    return [make(false), make(true)];
  }, [aspect]);

  if (!valid) {
    return (
      <Screen>
        <Notice tone="error" text="This photo could not be read. Please retake it." />
        <Button label="Retake" onPress={retake} />
      </Screen>
    );
  }

  const confirm = async () => {
    if (!view || !img || !doc) return;
    setBusy(true);
    setError(undefined);
    try {
      const out = await renderDocumentPhoto(src.uri, toSourceCrop(view, img, src, aspect), doc);
      const kept = await officialStorage.saveTemp(out.uri); // keep outputs inside the managed temp folder
      await officialStorage.remove(out.uri);
      router.push({ pathname: '/official/result', params: { country: p.country, doc: p.doc, uri: kept } });
    } catch (e) {
      setError(`Could not crop the photo: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const dim = 'rgba(0,0,0,0.55)';
  return (
    <View style={styles.root}>
      <View style={styles.area} onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {img ? (
          <View style={{ position: 'absolute', left: img.x, top: img.y, width: img.w, height: img.h }}>
            <Image source={{ uri: src.uri }} style={StyleSheet.absoluteFill} contentFit="fill" onError={() => setError('The photo could not be displayed. Please retake it.')} />
            {view ? (
              <>
                {/* dimmed surround */}
                <View pointerEvents="none" style={[styles.abs, { left: 0, right: 0, top: 0, height: view.y, backgroundColor: dim }]} />
                <View pointerEvents="none" style={[styles.abs, { left: 0, right: 0, top: view.y + view.w / aspect, bottom: 0, backgroundColor: dim }]} />
                <View pointerEvents="none" style={[styles.abs, { left: 0, width: view.x, top: view.y, height: view.w / aspect, backgroundColor: dim }]} />
                <View pointerEvents="none" style={[styles.abs, { left: view.x + view.w, right: 0, top: view.y, height: view.w / aspect, backgroundColor: dim }]} />
                <View
                  {...mover.panHandlers}
                  accessibilityLabel="Crop frame. Drag to move."
                  style={[styles.abs, styles.frame, { left: view.x, top: view.y, width: view.w, height: view.w / aspect }]}
                >
                  <View {...resizer.panHandlers} accessibilityLabel="Resize crop frame" style={styles.handle}>
                    <View style={styles.handleDot} />
                  </View>
                </View>
              </>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        {error ? <Notice tone="error" text={error} /> : <P style={{ color: '#ddd', textAlign: 'center' }}>Drag to move · drag the corner to resize</P>}
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button label="Retake" variant="secondary" style={{ flex: 1 }} disabled={busy} onPress={retake} />
          <Button label="Use Photo" style={{ flex: 1 }} busy={busy} disabled={!view} onPress={confirm} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111' },
  area: { flex: 1 },
  abs: { position: 'absolute' },
  frame: { borderWidth: 2, borderColor: '#fff' },
  // Inside the frame's bottom-right corner, so it can never hang off the image or screen edge.
  handle: { position: 'absolute', right: 0, bottom: 0, width: HANDLE, height: HANDLE, alignItems: 'flex-end', justifyContent: 'flex-end', padding: 4 },
  handleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.purple, borderWidth: 3, borderColor: '#fff' },
  bar: { padding: space.md, gap: space.sm, backgroundColor: '#111' },
});
