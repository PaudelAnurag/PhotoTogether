import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.cream },
          headerTintColor: colors.purple,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          headerTitleStyle: { color: colors.ink },
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="official/document" options={{ title: 'Document' }} />
        <Stack.Screen name="official/camera" options={{ title: 'Official photo' }} />
        <Stack.Screen name="official/crop" options={{ title: 'Adjust photo', headerBackVisible: false, gestureEnabled: false }} />
        <Stack.Screen name="official/result" options={{ title: 'Preview & export' }} />
        <Stack.Screen name="together/session" options={{ title: 'Together Booth' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
