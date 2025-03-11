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
    // You could add custom fonts here
    // 'Ubuntu-Regular': require('../assets/fonts/Ubuntu-Regular.ttf'),
    // 'Ubuntu-Medium': require('../assets/fonts/Ubuntu-Medium.ttf'),
    // 'Ubuntu-Bold': require('../assets/fonts/Ubuntu-Bold.ttf'),
  });

  useEffect(() => {
    // Add any app initialization logic here
  }, []);

  if (!fontsLoaded) {
    // We can return a loading screen here if needed
    return null;
  }

  return (
    <ThemeProvider forcedTheme="dark">
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ThemeProvider>
  );
}