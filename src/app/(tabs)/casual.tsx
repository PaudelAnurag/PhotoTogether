import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Pressable, ScrollView, View } from 'react-native';
import { useIsFocused } from 'expo-router';
import { CameraCapture } from '../../components/CameraCapture';
import { ExportBar } from '../../components/ExportBar';
import { Button, H1, P, Screen } from '../../components/ui';
import { saveToDevice, shareFile } from '../../services/exportService';
import { colors, radius, space } from '../../theme';
import type { CapturedPhoto } from '../../types';

/** Casual flow: no guides, no face detection, no document rules. Camera -> keep/retake -> gallery (save/share), repeat. */
export default function Casual() {
  const [pending, setPending] = useState<CapturedPhoto>();
  const [kept, setKept] = useState<CapturedPhoto[]>([]);
  const [selected, setSelected] = useState<number>();
  const [shooting, setShooting] = useState(false);
  const focused = useIsFocused(); // tab screens stay mounted: release the camera when another tab or screen is on top
  const insets = useSafeAreaInsets();

  const current = selected !== undefined ? kept[selected] : undefined;

  if (pending) {
    return (
      <Screen header={false}>
        <H1>Keep this photo?</H1>
        <Image source={{ uri: pending.uri }} style={{ width: '100%', aspectRatio: pending.width / pending.height, borderRadius: radius.lg }} contentFit="cover" />
        <Button label="Keep" onPress={() => { setKept((k) => [pending, ...k]); setSelected(undefined); setPending(undefined); }} />
        <Button label="Retake" variant="secondary" onPress={() => setPending(undefined)} />
      </Screen>
    );
  }

  if (kept.length === 0 || shooting) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', paddingTop: insets.top }}>
        {focused ? <CameraCapture bottomInset={0} onCapture={(p) => { setShooting(false); setPending(p); }} /> : null}
      </View>
    );
  }

  return (
    <Screen header={false}>
      <P>{kept.length} photo{kept.length > 1 ? 's' : ''} this session — tap one to save or share</P>
      <ScrollView horizontal contentContainerStyle={{ gap: space.sm }}>
        {kept.map((p, i) => (
          <Pressable key={p.uri} accessibilityRole="button" accessibilityLabel={`Photo ${kept.length - i}`} onPress={() => setSelected(i === selected ? undefined : i)}>
            <Image source={{ uri: p.uri }} style={{ width: 72, height: 96, borderRadius: radius.sm, borderWidth: 3, borderColor: i === selected ? colors.purple : 'transparent' }} />
          </Pressable>
        ))}
      </ScrollView>
      {current && (
        <ExportBar
          actions={[
            { label: 'Save to device', primary: true, run: () => saveToDevice([current.uri]) },
            { label: 'Share', run: () => shareFile(current.uri, 'image/jpeg') },
          ]}
        />
      )}
      {kept.length > 1 && <ExportBar actions={[{ label: `Save all ${kept.length} to device`, run: () => saveToDevice(kept.map((k) => k.uri)) }]} />}
      <Button label="Take another photo" variant="secondary" onPress={() => setShooting(true)} />
    </Screen>
  );
}
