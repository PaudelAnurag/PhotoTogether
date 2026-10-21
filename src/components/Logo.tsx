import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/** App mark: gradient squircle, camera, heart. Drawn in code so there is no image asset to ship. */
export function Logo({ size = 96 }: { size?: number }) {
  return (
    <LinearGradient colors={['#A78BFA', '#6B3FC0']} style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="camera" size={size * 0.56} color="#fff" />
      <View style={{ position: 'absolute', right: size * 0.1, top: size * 0.1 }}>
        <Ionicons name="heart" size={size * 0.26} color="#FF7AA8" />
      </View>
    </LinearGradient>
  );
}
