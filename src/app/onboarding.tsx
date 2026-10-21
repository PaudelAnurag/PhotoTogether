import { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../components/ui';
import { Logo } from '../components/Logo';
import { colors, gradients, radius, space } from '../theme';

const ONBOARDED_KEY = 'pt.onboarded.v1';

type Icon = keyof typeof Ionicons.glyphMap;
const SLIDES: { title: string; text: string; icon: Icon; sub: [Icon, Icon]; grad: readonly [string, string]; ink: string }[] = [
  { title: 'Welcome to PhotoTogether', text: 'Official photos, fun photo strips, and moments with the people you care about.', icon: 'camera', sub: ['heart', 'sparkles'], grad: ['#E9DEFF', '#F6F0FF'], ink: colors.purple },
  { title: 'Together Booth', text: 'Make memories together, even from different places. Nobody peeks until the big reveal.', icon: 'heart', sub: ['people', 'sparkles'], grad: gradients.pink, ink: colors.pinkInk },
  { title: 'Official Photos', text: 'Passport, visa and ID photos with the right size, framing and rules for your country.', icon: 'id-card', sub: ['shield-checkmark', 'images'], grad: gradients.blue, ink: colors.blueInk },
  { title: 'Casual Photos', text: 'Take everyday photos whenever you want, then save or share them in a tap.', icon: 'camera', sub: ['images', 'sparkles'], grad: gradients.peach, ink: colors.peachInk },
];

/** Icon bobbing gently so the slide feels alive. */
function Float({ children, delay = 0, amp = 8 }: { children: React.ReactNode; delay?: number; amp?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1400, delay, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  return <Animated.View style={{ transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -amp] }) }] }}>{children}</Animated.View>;
}

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const list = useRef<FlatList>(null);
  const x = useRef(new Animated.Value(0)).current;
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;

  const finish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      // onboarding will simply show again next launch
    }
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Logo size={36} />
        <Pressable accessibilityRole="button" accessibilityLabel="Skip introduction" onPress={finish} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Animated.FlatList
        ref={list}
        data={SLIDES}
        keyExtractor={(s) => s.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: space.lg, gap: space.lg }}>
            <LinearGradient colors={item.grad} style={styles.hero}>
              <Float>
                <View style={[styles.iconCircle, { shadowColor: item.ink }]}>
                  <Ionicons name={item.icon} size={84} color={item.ink} />
                </View>
              </Float>
              <View style={[styles.sub, { left: 28, top: 40 }]}><Float delay={300} amp={6}><Ionicons name={item.sub[0]} size={34} color={item.ink} /></Float></View>
              <View style={[styles.sub, { right: 28, bottom: 48 }]}><Float delay={600} amp={6}><Ionicons name={item.sub[1]} size={30} color={item.ink} /></Float></View>
            </LinearGradient>
            <View style={{ gap: space.sm }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, k) => (
            <Animated.View
              key={k}
              style={[
                styles.dot,
                {
                  width: x.interpolate({ inputRange: [(k - 1) * width, k * width, (k + 1) * width], outputRange: [8, 24, 8], extrapolate: 'clamp' }),
                  opacity: x.interpolate({ inputRange: [(k - 1) * width, k * width, (k + 1) * width], outputRange: [0.35, 1, 0.35], extrapolate: 'clamp' }),
                },
              ]}
            />
          ))}
        </View>
        <Button
          label={last ? 'Get Started' : 'Next'}
          onPress={last ? finish : () => { list.current?.scrollToOffset({ offset: (i + 1) * width, animated: true }); setI(i + 1); }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.sm },
  skip: { color: colors.muted, fontSize: 16, fontWeight: '600' },
  hero: { height: 340, borderRadius: radius.lg + 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  iconCircle: { width: 168, height: 168, borderRadius: 84, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  sub: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink },
  text: { fontSize: 17, lineHeight: 25, color: colors.muted },
  bottom: { padding: space.lg, gap: space.lg },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4, backgroundColor: colors.purple },
});
