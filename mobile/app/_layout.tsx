// Path: mobile/app/_layout.tsx

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useColorScheme, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    'FontAwesome': require('../assets/fonts/FontAwesome.ttf'),
    'FontAwesome5_Brands': require('../assets/fonts/FontAwesome5_Brands.ttf'),
    'FontAwesome5_Regular': require('../assets/fonts/FontAwesome5_Regular.ttf'),
    'FontAwesome5_Solid': require('../assets/fonts/FontAwesome5_Solid.ttf'),
    'FontAwesome6_Brands': require('../assets/fonts/FontAwesome6_Brands.ttf'),
    'FontAwesome6_Regular': require('../assets/fonts/FontAwesome6_Regular.ttf'),
    'FontAwesome6_Solid': require('../assets/fonts/FontAwesome6_Solid.ttf'),
    'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  });

  useEffect(() => {
    // App initialization logic
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }} /> {/* Hide ALL headers at the root level */}
          <Toast />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}