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
    refreshProfile: () => Promise<boolean>;
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