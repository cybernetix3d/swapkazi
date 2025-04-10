import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary' | 'muted';
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  children, 
  style, 
  variant = 'primary', 
  ...props 
}) => {
  const { colors } = useTheme();
  
  const getColor = () => {
    switch (variant) {
      case 'secondary':
        return colors.text.secondary;
      case 'muted':
        return colors.text.muted;
      case 'primary':
      default:
        return colors.text.primary;
    }
  };
  
  return (
    <Text 
      style={[
        { color: getColor() },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};
