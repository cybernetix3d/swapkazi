import React, { useState, useEffect } from 'react';
import { Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import * as Font from 'expo-font';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  solid?: boolean;
  brand?: boolean;
  style?: any;
}

// Map FontAwesome icon names to Ionicons names
const iconMap: Record<string, string> = {
  // Bottom tab icons
  'home': 'home',
  'store': 'storefront',
  'comments': 'chatbubbles',
  'exchange-alt': 'swap-horizontal',
  'user': 'person',

  // Profile screen icons
  'user-edit': 'create',
  'moon': 'moon',
  'sign-out-alt': 'log-out',

  // Common icons
  'star': 'star',
  'arrow-right': 'arrow-forward',
  'camera': 'camera',
  'save': 'save',
  'times': 'close',
  'comment': 'chatbubble',
  'plus-circle': 'add-circle',
  'plus': 'add',
  'add': 'add',
  'image': 'image',
  'paper-plane': 'paper-plane',
  'filter': 'filter',
  'search': 'search',
  'check': 'checkmark',
  'trash': 'trash',
  'edit': 'create',
  'cog': 'settings',
  'bell': 'notifications',
  'calendar': 'calendar',
  'map-marker-alt': 'location',
  'info-circle': 'information-circle',
  'sync': 'refresh',
  'refresh': 'refresh',
  'sliders-h': 'options',
  'options': 'options',
  'clock': 'time',
  'time': 'time',
  'sort-amount-down': 'arrow-down',
  'sort-amount-up': 'arrow-up',
  'arrow-left': 'arrow-back',
  'arrow-back': 'arrow-back',

  // Category icons
  'box': 'cube',
  'hands-helping': 'hand-left',
  'utensils': 'restaurant',
  'paint-brush': 'brush',
  'laptop': 'laptop',
  'tshirt': 'shirt',
  'couch': 'bed',
  'book': 'book',
  'tools': 'construct',
  'graduation-cap': 'school',
  'car': 'car',
  'question-circle': 'help-circle'
};

// Track font loading state globally
let isFontLoaded = false;

/**
 * Custom Icon component that uses Ionicons for better compatibility
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  color,
  solid = true,
  brand = false,
  style
}) => {
  const { colors } = useTheme();
  const [fontReady, setFontReady] = useState(isFontLoaded);

  // Use the provided color or default to the primary text color
  const iconColor = color || colors.text.primary;

  // Map the FontAwesome icon name to Ionicons name
  const ionIconName = iconMap[name] || 'help-circle';

  useEffect(() => {
    if (!isFontLoaded) {
      async function loadFont() {
        try {
          await Font.loadAsync(Ionicons.font);
          isFontLoaded = true;
          setFontReady(true);
        } catch (error) {
          console.error('Error loading Ionicons font:', error);
        }
      }
      loadFont();
    }
  }, []);

  if (!fontReady) {
    return <ActivityIndicator size="small" color={iconColor} />;
  }

  try {
    return (
      <Ionicons
        name={solid ? ionIconName : `${ionIconName}-outline`}
        size={size}
        color={iconColor}
        style={style}
      />
    );
  } catch (error) {
    console.error(`Error rendering icon: ${name}`, error);
    // Fallback to a text representation if icon fails
    return <Text style={[{ color: iconColor, fontSize: size }, style]}>•</Text>;
  }
};

export default Icon;
