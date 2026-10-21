import { ReactNode, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from 'expo-camera';
import { Button, Notice, P } from './ui';
import { colors, radius, space } from '../theme';
import type { CapturedPhoto } from '../types';

type Props = {
  onCapture: (photo: CapturedPhoto) => void;
  initialFacing?: CameraType;
  showFlash?: boolean;
  showSwitch?: boolean;
  /** Drawn over the preview (guides). */
  overlay?: ReactNode;
  /** Optional small status chip (e.g. "Photo 2 of 4"). Nothing else is written over the preview. */
  caption?: string;
  /** Space under the button. Defaults to the device inset; pass 0 when a tab bar already covers it. */
  bottomInset?: number;
};

const FLASH_CYCLE: FlashMode[] = ['off', 'on', 'auto'];

/** Full-bleed camera + permission handling + bottom-center "Capture Photo". Knows nothing about what the photo is for. */
export function CameraCapture({ onCapture, initialFacing = 'back', showFlash = true, showSwitch = true, overlay, caption, bottomInset }: Props) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>(initialFacing);
  const [flash, setFlash] = useState<FlashMode>('off');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  if (!permission) return <View style={styles.fill} />;

  if (!permission.granted) {
    return (
      <View style={[styles.fill, styles.center]}>
        <P>PhotoTogether needs camera access to take photos.</P>
        {permission.canAskAgain ? (
          <Button label="Allow camera" onPress={requestPermission} />
        ) : (
          <>
            <Notice tone="warn" text="Camera access was denied. Turn it on for PhotoTogether in your device Settings, then come back." />
            <Button label="Open Settings" onPress={() => Linking.openSettings()} />
          </>
        )}
      </View>
    );
  }

  const capture = async () => {
    if (!ref.current || busy || !ready) return;
    setBusy(true);
    setError(undefined);
    try {
      const pic = await ref.current.takePictureAsync({ quality: 1 });
      if (!pic?.uri || !pic.width || !pic.height) throw new Error('The camera returned an empty image.');
      onCapture({ uri: pic.uri, width: pic.width, height: pic.height });
    } catch (e) {
      setError(`Could not take the photo: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.fill}>
      {/* Selfie preview is mirrored; mirror the saved photo too so what you framed is what you get. Back camera: never mirrored. */}
      <CameraView
        ref={ref}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        mirror={facing === 'front'}
        onCameraReady={() => setReady(true)}
        onMountError={(e) => setError(`Camera failed to start: ${e.message}`)}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {overlay}
      </View>

      <View style={styles.topBar}>
        {showFlash && facing === 'back' ? (
          <Pill label={`Flash: ${flash}`} onPress={() => setFlash(FLASH_CYCLE[(FLASH_CYCLE.indexOf(flash) + 1) % FLASH_CYCLE.length])} />
        ) : (
          <View />
        )}
        {caption ? <Pill label={caption} /> : null}
        {showSwitch ? (
          // onCameraReady fires once per mount, not per lens change, so never reset `ready` here.
          <Pill label="Flip" onPress={() => setFacing(facing === 'back' ? 'front' : 'back')} />
        ) : (
          <View />
        )}
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(bottomInset ?? insets.bottom, space.md) }]}>
        {error ? <Notice tone="error" text={error} /> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Capture Photo"
          onPress={capture}
          disabled={busy || !ready}
          style={[styles.capture, (busy || !ready) && { opacity: 0.6 }]}
        >
          {busy || !ready ? <ActivityIndicator color="#fff" /> : <Text style={styles.captureText}>Capture Photo</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const Pill = ({ label, onPress }: { label: string; onPress?: () => void }) => (
  <Pressable accessibilityRole={onPress ? 'button' : 'text'} accessibilityLabel={label} onPress={onPress} disabled={!onPress} style={styles.pill}>
    <Text style={styles.pillText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  center: { backgroundColor: colors.cream, padding: space.lg, gap: space.md, justifyContent: 'center' },
  topBar: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
  pillText: { color: '#fff', fontWeight: '700' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg },
  capture: { minWidth: 220, minHeight: 58, borderRadius: radius.pill, backgroundColor: colors.purple, borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  captureText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
