import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, radius, space } from '../theme';

/** `header={false}` for screens without a navigation header (they own the status-bar inset). */
export function Screen({ children, scroll = true, header = true, style }: { children: ReactNode; scroll?: boolean; header?: boolean; style?: ViewStyle }) {
  return (
    <SafeAreaView style={styles.screen} edges={header ? ['bottom', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.pad, header && styles.padHeader, style]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.pad, header && styles.padHeader, { flex: 1 }, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export const H1 = ({ children }: { children: ReactNode }) => <Text style={styles.h1}>{children}</Text>;
export const P = ({ children, muted = true, style }: { children: ReactNode; muted?: boolean; style?: object }) => (
  <Text style={[styles.p, muted && { color: colors.muted }, style]}>{children}</Text>
);

type BtnProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  busy?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', disabled, busy, style }: BtnProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || busy}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        isPrimary && { backgroundColor: colors.purple },
        variant === 'secondary' && { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
        variant === 'danger' && { backgroundColor: colors.pink },
        (disabled || busy) && { opacity: 0.5 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={isPrimary ? '#fff' : colors.purple} />
      ) : (
        <Text style={[styles.btnText, { color: isPrimary ? '#fff' : variant === 'danger' ? colors.pinkInk : colors.purpleDark }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Card({ children, tint = colors.card, onPress, style }: { children: ReactNode; tint?: string; onPress?: () => void; style?: ViewStyle }) {
  const body = <View style={[styles.card, { backgroundColor: tint }, style]}>{children}</View>;
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
      {body}
    </Pressable>
  ) : (
    body
  );
}

export function Dots({ count, index }: { count: number; index: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, i === index && styles.dotOn]} />
      ))}
    </View>
  );
}

export function Notice({ text, tone = 'info' }: { text: string; tone?: 'info' | 'warn' | 'ok' | 'error' }) {
  const bg = { info: colors.lavender, warn: colors.peach, ok: '#DDF5E7', error: colors.pink }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: bg }]}>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  pad: { padding: space.lg, gap: space.md, flexGrow: 1 },
  padHeader: { paddingTop: space.sm }, // the native header already provides the top gap
  h1: { fontSize: 28, fontWeight: '800', color: colors.ink },
  p: { fontSize: 16, lineHeight: 23, color: colors.ink },
  btn: { minHeight: 54, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  btnText: { fontSize: 17, fontWeight: '700' },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.sm, borderWidth: 1, borderColor: colors.line },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotOn: { backgroundColor: colors.purple, width: 22 },
  notice: { borderRadius: radius.md, padding: space.md },
  noticeText: { fontSize: 14, lineHeight: 20, color: colors.ink },
});
