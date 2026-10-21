import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logo } from '../components/Logo';
import { gradients } from '../theme';

const ONBOARDED_KEY = 'pt.onboarded.v1';
const SPLASH_MS = 1700;

/** Animated splash. Doubles as the startup gate: first launch -> onboarding, otherwise -> home. */
export default function Splash() {
  const pop = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 700, delay: 250, useNativeDriver: true }),
    ]).start();
    const wait = new Promise((r) => setTimeout(r, SPLASH_MS));
    const seen = AsyncStorage.getItem(ONBOARDED_KEY).catch(() => null);
    Promise.all([seen, wait]).then(([v]) => router.replace(v ? '/home' : '/onboarding'));
  }, [pop, fade]);

  return (
    <LinearGradient colors={gradients.splash} style={styles.root}>
      <Animated.View style={{ transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }], opacity: pop }}>
        <Logo size={120} />
      </Animated.View>
      <Animated.View style={{ opacity: fade, alignItems: 'center', gap: 8 }}>
        <Text style={styles.name}>PhotoTogether</Text>
        <Text style={styles.tag}>Real moments. No distance.</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  name: { color: '#fff', fontSize: 34, fontWeight: '800' },
  tag: { color: 'rgba(255,255,255,0.85)', fontSize: 17 },
});
