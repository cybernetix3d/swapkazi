import Colors from './Colors';

export const FONT = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  icon: 'FontAwesome5_Solid',
  iconBrands: 'FontAwesome5_Brands',
  iconRegular: 'FontAwesome5_Regular',

  // Font sizes
  sizes: {
    xs: 10,
    small: 12,
    medium: 14,
    large: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    title: 32,
  },
};

export const SPACING = {
  xs: 4,
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  xxl: 48,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 8,
  },
};

export const SIZES = {
  // Screen dimensions percentages
  width: {
    full: '100%',
    half: '50%',
    quarter: '25%',
    threeQuarters: '75%',
  },
  // Component sizes
  buttonHeight: 48,
  inputHeight: 48,
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 24,
    round: 999,
  },
  iconSize: {
    small: 16,
    medium: 24,
    large: 32,
  },
};

// Function to get theme colors based on mode
export const getThemeColors = (mode: 'light' | 'dark') => {
  return {
    primary: Colors.primary,
    secondary: Colors.secondary,
    accent: Colors.accent,
    background: {
      dark: Colors.background.dark,
      darker: Colors.background.darker,
      card: Colors.background.card,
    },
    text: {
      primary: mode === 'dark' ? Colors.text.dark.primary : Colors.text.light.primary,
      secondary: mode === 'dark' ? Colors.text.dark.secondary : Colors.text.light.secondary,
      muted: mode === 'dark' ? Colors.text.dark.muted : Colors.text.light.muted,
    },
    border: mode === 'dark' ? Colors.border.dark : Colors.border.light,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    info: Colors.info,
    transparent: Colors.transparent,
    mode: mode,
  };
};

export default {
  FONT,
  SPACING,
  SHADOWS,
  SIZES,
  getThemeColors,
};