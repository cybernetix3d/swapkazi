// Re-export all types from individual files
// User and Auth types
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  phoneNumber?: string;
  skills: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  talentBalance: number;
  ratings: Rating[];
  averageRating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  user: string | User;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  skills?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Listing types
export type ListingCategory = 
  | 'Goods'
  | 'Services'
  | 'Food'
  | 'Crafts'
  | 'Electronics'
  | 'Clothing'
  | 'Furniture'
  | 'Books'
  | 'Tools'
  | 'Education'
  | 'Transportation'
  | 'Other';

export type ItemCondition = 
  | 'New'
  | 'Like New'
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Not Applicable';

export type ListingType = 'Offer' | 'Request';

export type ExchangeType = 'Talent' | 'Direct Swap' | 'Both';

export interface ListingImage {
  url: string;
  caption?: string;
}

export interface Listing {
  _id: string;
  user: string | User;
  title: string;
  description: string;
  category: ListingCategory;
  subCategory?: string;
  images: ListingImage[];
  condition: ItemCondition;
  listingType: ListingType;
  exchangeType: ExchangeType;
  talentPrice: number;
  swapFor?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  likes: string[] | User[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFormData {
  title: string;
  description: string;
  category: ListingCategory;
  subCategory?: string;
  images: ListingImage[];
  condition: ItemCondition;
  listingType: ListingType;
  exchangeType: ExchangeType;
  talentPrice?: number;
  swapFor?: string;
  location?: {
    coordinates: [number, number];
    address: string;
  };
}

export interface ListingFilter {
  category?: ListingCategory;
  listingType?: ListingType;
  exchangeType?: ExchangeType;
  priceMin?: number;
  priceMax?: number;
  nearMe?: boolean;
  distance?: number;
  searchTerm?: string;
  sortBy?: 'newest' | 'oldest' | 'priceAsc' | 'priceDesc';
  page?: number;
  limit?: number;
}

// Transaction types
export type TransactionStatus = 
  | 'Proposed'
  | 'Accepted'
  | 'Rejected'
  | 'Completed'
  | 'Cancelled'
  | 'Disputed'
  | 'Resolved';

export type TransactionType = 'Talent' | 'Direct Swap' | 'Combined';

export interface TransactionItem {
  description: string;
  images?: string[];
}

export interface TransactionMessage {
  sender: string | User;
  content: string;
  timestamp: string;
}

export interface TransactionRating {
  rating: number;
  comment?: string;
  timestamp?: string;
}

export interface StatusHistoryItem {
  status: TransactionStatus;
  timestamp: string;
  updatedBy: string | User;
}

export interface Transaction {
  _id: string;
  initiator: string | User;
  recipient: string | User;
  listing?: string | Listing;
  status: TransactionStatus;
  type: TransactionType;
  talentAmount: number;
  items: TransactionItem[];
  messages: TransactionMessage[];
  meetupLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  meetupTime?: string;
  initiatorRating?: TransactionRating;
  recipientRating?: TransactionRating;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  recipientId: string;
  listingId?: string;
  type: TransactionType;
  talentAmount?: number;
  items?: TransactionItem[];
  message?: string;
  meetupLocation?: {
    coordinates: [number, number];
    address: string;
  };
  meetupTime?: string;
}

export interface TransactionFilter {
  status?: TransactionStatus;
  role?: 'initiator' | 'recipient' | 'both';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

// Message types
export interface ReadStatus {
  user: string | User;
  timestamp: string;
}

export interface Message {
  _id: string;
  conversation: string | Conversation;
  sender: string | User;
  content: string;
  attachments?: string[];
  readBy: ReadStatus[];
  isSystemMessage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: (string | User)[];
  listing?: string | Listing;
  transaction?: string | Transaction;
  lastMessage?: string | Message;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number; // Client-side computed property
}

export interface MessageFormData {
  conversationId: string;
  content: string;
  attachments?: string[];
}

export interface ConversationListItem extends Conversation {
  otherParticipant: User; // The other user in the conversation (client-side computed)
  lastMessageContent: string;
  lastMessageTime: string;
}

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