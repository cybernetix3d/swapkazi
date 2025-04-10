import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ThemedViewProps extends ViewProps {
  variant?: 'dark' | 'darker' | 'card';
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  children, 
  style, 
  variant = 'dark', 
  ...props 
}) => {
  const { colors } = useTheme();
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'darker':
        return colors.background.darker;
      case 'card':
        return colors.background.card;
      case 'dark':
      default:
        return colors.background.dark;
    }
  };
  
  return (
    <View 
      style={[
        { backgroundColor: getBackgroundColor() },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};
