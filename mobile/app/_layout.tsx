// Path: mobile/app/_layout.tsx

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [fontsLoaded] = useFonts({
    // Your fonts here
  });

  useEffect(() => {
    // App initialization logic
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider forcedTheme="dark">
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} /> {/* Hide ALL headers at the root level */}
      </AuthProvider>
    </ThemeProvider>
  );
}