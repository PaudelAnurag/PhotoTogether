import { ComponentRef, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { router } from 'expo-router';
import { CameraCapture } from '../../components/CameraCapture';
import { ExportBar } from '../../components/ExportBar';
import { Button, Card, H1, Notice, P, Screen } from '../../components/ui';
import { addPhoto, resetSession, reveal, useTogether } from '../../features/together/store';
import { albumPdf, emailAttachment, printAlbum, saveToDevice, shareFile } from '../../services/exportService';
import { colors, radius, space } from '../../theme';
import type { CapturedPhoto, TogetherRole } from '../../types';

export default function TogetherSession() {
  const t = useTogether();
  const [handedOver, setHandedOver] = useState(false);
  const [pending, setPending] = useState<CapturedPhoto>();
  const albumRef = useRef<ComponentRef<typeof View>>(null);

  if (!t.active) {
    return (
      <Screen>
        <P>No active session.</P>
        <Button label="Start a booth" onPress={() => router.replace('/together')} />
      </Screen>
    );
  }

  const role: TogetherRole | undefined = t.done.A < t.count ? 'A' : t.done.B < t.count && handedOver ? 'B' : undefined;

  // ---- Reveal ----
  if (t.revealed && t.album) {
    const { A, B } = t.album;
    const all = [...A, ...B];
    return (
      <Screen>
        <H1>Your album 💞</H1>
        <View ref={albumRef} collapsable={false} style={{ backgroundColor: colors.cream, padding: space.md, gap: space.sm, borderRadius: radius.lg }}>
          {A.map((a, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space.sm }}>
              <Image source={{ uri: a }} style={{ flex: 1, aspectRatio: 3 / 4, borderRadius: radius.sm }} contentFit="cover" />
              <Image source={{ uri: B[i] }} style={{ flex: 1, aspectRatio: 3 / 4, borderRadius: radius.sm }} contentFit="cover" />
            </View>
          ))}
        </View>
        <ExportBar
          actions={[
            { label: 'Save album image', primary: true, run: async () => saveToDevice([await captureRef(albumRef, { format: 'png', quality: 1 })]) },
            { label: 'Save all photos', run: () => saveToDevice(all) },
            { label: 'Share album image', run: async () => shareFile(await captureRef(albumRef, { format: 'png', quality: 1 }), 'image/png') },
            { label: 'Create PDF & share', run: async () => shareFile(await albumPdf(A, B), 'application/pdf') },
            { label: 'Print', run: () => printAlbum(A, B) },
            { label: 'Email PDF', run: async () => emailAttachment(await albumPdf(A, B), 'Our PhotoTogether album') },
          ]}
        />
        <Button label="New album" variant="secondary" onPress={() => { resetSession(); router.replace('/together'); }} />
      </Screen>
    );
  }

  // ---- Both done, waiting for reveal ----
  if (t.done.A === t.count && t.done.B === t.count) {
    return (
      <Screen>
        <H1>Both albums are complete 🎉</H1>
        <Notice tone="ok" text="Participant A has finished. Participant B has finished." />
        <Button label="Reveal the album" onPress={() => reveal()} />
      </Screen>
    );
  }

  // ---- Invite / hand over ----
  if (!role) {
    return (
      <Screen>
        <H1>Your photos are ready</H1>
        <P>Share the invitation with Participant B to complete your album.</P>
        <Notice tone="info" text="Participant A has finished. Waiting for Participant B." />
        <Card tint={colors.lavender}>
          <P muted={false}>Remote invitation links and codes are not available yet — they need a backend, which is outside Phase 1. Nothing here pretends otherwise.</P>
        </Card>
        <Button label="Hand the phone to Participant B" onPress={() => setHandedOver(true)} />
      </Screen>
    );
  }

  // ---- Capture for current role ----
  const done = t.done[role];
  const progress = `${done} of ${t.count} photos completed`;

  if (pending) {
    return (
      <Screen>
        <H1>Participant {role}: photo {done + 1} of {t.count}</H1>
        <Image source={{ uri: pending.uri }} style={{ width: '100%', aspectRatio: pending.width / pending.height, borderRadius: radius.lg }} contentFit="cover" />
        <Button label="Use this photo" onPress={() => { addPhoto(role, pending.uri); setPending(undefined); }} />
        <Button label="Retake" variant="secondary" onPress={() => setPending(undefined)} />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraCapture caption={`${role}: ${progress}`} onCapture={setPending} initialFacing="front" />
    </View>
  );
}
