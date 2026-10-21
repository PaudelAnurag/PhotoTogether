import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, H1, Notice, P, Screen } from '../../components/ui';
import { MAX_PHOTOS, MIN_PHOTOS, startSession } from '../../features/together/store';
import { colors } from '../../theme';

export default function TogetherStart() {
  const [n, setN] = useState(4);
  return (
    <Screen header={false}>
      <H1>How many photos would you like to take together?</H1>
      <Card tint={colors.pink} style={{ alignItems: 'center', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <Button label="−" variant="secondary" disabled={n <= MIN_PHOTOS} onPress={() => setN(n - 1)} style={{ width: 64 }} />
          <Text accessibilityLabel={`${n} photos`} style={{ fontSize: 56, fontWeight: '800', color: colors.pinkInk, minWidth: 64, textAlign: 'center' }}>{n}</Text>
          <Button label="+" variant="secondary" disabled={n >= MAX_PHOTOS} onPress={() => setN(n + 1)} style={{ width: 64 }} />
        </View>
        <P>Each of you takes {n} photos. Nobody sees the other’s photos until the reveal.</P>
      </Card>
      <Notice tone="warn" text="Phase 1 runs on one phone: Participant A shoots, then hands the phone to Participant B. Remote invitations and server-enforced privacy need a backend and are not built yet." />
      <Button label={`Start with ${n} photos`} onPress={() => { startSession(n); router.push('/together/session'); }} />
    </Screen>
  );
}
