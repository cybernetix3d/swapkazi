import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeColors } from '../constants/Theme';
import { ThemeContextType, ThemeColors } from '../types';

const defaultThemeContext: ThemeContextType = {
  theme: 'dark',
  isDark: true,
  colors: getThemeColors('dark'),
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
  forcedTheme?: 'light' | 'dark' | null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  forcedTheme = null 
}) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(forcedTheme || 'dark');
  
  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (forcedTheme) {
          setTheme(forcedTheme);
          return;
        }
        
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        } else {
          // Default to device theme if no saved preference, or 'dark' if that's not available
          setTheme((deviceTheme as 'light' | 'dark') || 'dark');
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    };
    
    loadTheme();
  }, [deviceTheme, forcedTheme]);
  
  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };
  
  // Create theme object with all colors
  const themeColors: ThemeColors = getThemeColors(theme);
  
  const contextValue: ThemeContextType = {
    theme,
    isDark: theme === 'dark',
    colors: themeColors,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => useContext(ThemeContext);