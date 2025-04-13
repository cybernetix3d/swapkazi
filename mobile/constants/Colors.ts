const Colors = {
  // Primary brand colors
  primary: '#F9C80E', // Yellow
  secondary: '#EA3546', // Red
  accent: '#43BCCD', // Turquoise

  // Dark theme UI Colors
  dark: {
    background: {
      main: '#121212',
      darker: '#0A0A0A',
      card: '#1E1E1E',
      elevated: '#2C2C2C',
      input: 'rgba(255, 255, 255, 0.08)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      muted: '#757575',
      inverse: '#121212',
    },
    border: '#2C2C2C',
    divider: 'rgba(255, 255, 255, 0.08)',
  },

  // Light theme UI Colors
  light: {
    background: {
      main: '#F0F2F5',  // Slightly darker white background
      darker: '#E4E6EB', // Darker shade for headers and footers
      card: '#FFFFFF',   // Keep cards white for contrast
      elevated: '#F5F7FA', // Slightly off-white for elevated elements
      input: 'rgba(0, 0, 0, 0.05)', // Slightly more visible input backgrounds
    },
    text: {
      primary: '#121212',
      secondary: '#505050',
      muted: '#757575',
      inverse: '#FFFFFF',
    },
    border: '#D0D0D0',  // Slightly darker border color for better visibility
    divider: 'rgba(0, 0, 0, 0.12)', // More visible dividers
  },

  // Status colors
  status: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },

  // Transaction status colors
  transaction: {
    proposed: '#FFC107', // Warning/Yellow
    accepted: '#2196F3', // Info/Blue
    completed: '#4CAF50', // Success/Green
    rejected: '#F44336', // Error/Red
    cancelled: '#F44336', // Error/Red
    disputed: '#EA3546', // Secondary/Red
    resolved: '#43BCCD', // Accent/Turquoise
  },

  // Special
  transparent: 'transparent',
};

export default Colors;