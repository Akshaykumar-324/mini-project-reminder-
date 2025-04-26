import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import FontProvider from '@/providers/FontProvider';
import AlarmProvider from '@/providers/AlarmProvider';
import NotificationProvider from '@/providers/NotificationProvider';
import ThemeProvider from '@/providers/ThemeProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useNotificationHandler } from '@/hooks/useNotificationHandlet';

function RootLayoutNav() {
  const { isDark } = useTheme();
 // useNotificationHandler();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <FontProvider>
        <NotificationProvider>
          <AlarmProvider>
            <RootLayoutNav />
          </AlarmProvider>
        </NotificationProvider>
      </FontProvider>
    </ThemeProvider>
  );
}