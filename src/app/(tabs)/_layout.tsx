import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

type Icon = keyof typeof Ionicons.glyphMap;
const tab = (title: string, on: Icon, off: Icon) => ({
  title,
  tabBarIcon: ({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) => <Ionicons name={focused ? on : off} size={size + 2} color={color as string} />,
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.line },
        sceneStyle: { backgroundColor: colors.cream },
      }}
    >
      <Tabs.Screen name="home" options={tab('Home', 'home', 'home-outline')} />
      <Tabs.Screen name="together" options={tab('Together', 'heart', 'heart-outline')} />
      <Tabs.Screen name="official" options={tab('Official', 'id-card', 'id-card-outline')} />
      <Tabs.Screen name="casual" options={tab('Casual', 'camera', 'camera-outline')} />
    </Tabs>
  );
}
