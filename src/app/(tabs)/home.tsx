import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Logo } from '../../components/Logo';
import { Card, Screen } from '../../components/ui';
import { colors, gradients, radius } from '../../theme';

type Icon = keyof typeof Ionicons.glyphMap;
const FEATURES: { icon: Icon; title: string; text: string; grad: readonly [string, string]; ink: string; href: '/together' | '/official' | '/casual' }[] = [
  { icon: 'heart', title: 'Together Booth', text: 'Create a photo album together.', grad: gradients.pink, ink: colors.pinkInk, href: '/together' },
  { icon: 'id-card', title: 'Official Photos', text: 'Prepare photos for your documents.', grad: gradients.blue, ink: colors.blueInk, href: '/official' },
  { icon: 'camera', title: 'Casual Photos', text: 'Capture everyday moments.', grad: gradients.peach, ink: colors.peachInk, href: '/casual' },
];

export default function Home() {
  return (
    <Screen header={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Logo size={44} />
        <View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink }}>PhotoTogether</Text>
          <Text style={{ color: colors.muted }}>Real moments. No distance.</Text>
        </View>
      </View>

      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radius.lg, padding: 24, gap: 6, overflow: 'hidden' }}>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>What shall we capture today?</Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 21 }}>Pick a mode below. No account needed.</Text>
        <Ionicons name="sparkles" size={90} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', right: -8, bottom: -10 }} />
      </LinearGradient>

      {FEATURES.map((f) => (
        <Card key={f.title} onPress={() => router.navigate(f.href)} tint="#fff" style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 14 }}>
          <LinearGradient colors={f.grad} style={{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={f.icon} size={32} color={f.ink} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: colors.ink }}>{f.title}</Text>
            <Text style={{ fontSize: 15, color: colors.muted }}>{f.text}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={f.ink} />
        </Card>
      ))}

      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
        <Ionicons name="shield-checkmark" size={16} color={colors.muted} />
        <Text style={{ color: colors.muted, fontSize: 13 }}>Official photos stay on your device.</Text>
      </View>
      <Text accessibilityRole="link" onPress={() => router.push('/onboarding')} style={{ color: colors.purple, fontWeight: '700', textAlign: 'center', paddingVertical: 8 }}>
        View intro again
      </Text>
    </Screen>
  );
}
