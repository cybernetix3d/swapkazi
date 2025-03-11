export * from './auth';
export * from './listing';
export * from './transaction';
export * from './message';

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    dark: string;
    darker: string;
    card: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  transparent: string;
  mode: 'light' | 'dark';
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
  message?: string;
  error?: string;
}

// App Navigation types
export type RootStackParamList = {
  '(auth)': undefined;
  '(app)': undefined;
  'modal': { title: string; content: string };
};

export type AuthStackParamList = {
  'login': undefined;
  'register': undefined;
  'forgot-password': undefined;
};

export type AppTabParamList = {
  'home': undefined;
  'marketplace': undefined;
  'messages': undefined;
  'transactions': undefined;
  'profile': undefined;
};

export type HomeStackParamList = {
  'index': undefined;
};

export type MarketplaceStackParamList = {
  'index': undefined;
  'search': undefined;
  'create': undefined;
  '[id]': { id: string };
};

export type MessagesStackParamList = {
  'index': undefined;
  '[id]': { id: string };
};

export type TransactionsStackParamList = {
  'index': undefined;
  '[id]': { id: string };
};

export type ProfileStackParamList = {
  'index': undefined;
  'edit': undefined;
  '[id]': { id: string };
};