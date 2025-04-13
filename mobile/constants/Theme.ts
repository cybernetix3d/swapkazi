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
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10.32,
    elevation: 8,
  },
  // Light mode specific shadows
  light: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 4,
    },
  },
  // Dark mode specific shadows
  dark: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,
      elevation: 9,
    },
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
  const themeColors = mode === 'dark' ? Colors.dark : Colors.light;
  const themeShadows = mode === 'dark' ? SHADOWS.dark : SHADOWS.light;

  return {
    // Brand colors
    primary: Colors.primary,
    secondary: Colors.secondary,
    accent: Colors.accent,

    // Background colors
    background: {
      dark: themeColors.background.main,
      darker: themeColors.background.darker,
      card: themeColors.background.card,
      elevated: themeColors.background.elevated,
      input: themeColors.background.input,
    },

    // Text colors
    text: {
      primary: themeColors.text.primary,
      secondary: themeColors.text.secondary,
      muted: themeColors.text.muted,
      inverse: themeColors.text.inverse,
    },

    // Border and divider colors
    border: themeColors.border,
    divider: themeColors.divider,

    // Status colors
    success: Colors.status.success,
    warning: Colors.status.warning,
    error: Colors.status.error,
    info: Colors.status.info,

    // Transaction status colors
    transaction: {
      proposed: Colors.transaction.proposed,
      accepted: Colors.transaction.accepted,
      completed: Colors.transaction.completed,
      rejected: Colors.transaction.rejected,
      cancelled: Colors.transaction.cancelled,
      disputed: Colors.transaction.disputed,
      resolved: Colors.transaction.resolved,
    },

    // Theme-specific shadows
    shadows: {
      small: themeShadows.small,
      medium: themeShadows.medium,
      large: themeShadows.large,
    },

    // Special
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