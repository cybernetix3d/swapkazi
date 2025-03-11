import { User, RegisterData, AuthResponse } from '../types';

/**
 * Mock login implementation
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, any email/password combination will work
  const mockUser: User = {
    _id: '1',
    email,
    username: email.split('@')[0],
    fullName: 'Demo User',
    bio: 'I love bartering in my community!',
    skills: ['Cooking', 'Gardening', 'Painting'],
    talentBalance: 50,
    avatar: 'https://via.placeholder.com/150',
    phoneNumber: '+27 123 456 789',
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249], // Cape Town coordinates
      address: 'Cape Town, South Africa'
    },
    ratings: [],
    averageRating: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    token: 'mock-jwt-token-12345',
    user: mockUser
  };
};

/**
 * Mock register implementation
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockUser: User = {
    _id: '1',
    email: userData.email,
    username: userData.username,
    fullName: userData.fullName,
    bio: '',
    skills: userData.skills || [],
    talentBalance: 10, // Starting balance
    avatar: 'https://via.placeholder.com/150',
    phoneNumber: userData.phoneNumber || '',
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249], // Cape Town coordinates
      address: 'Cape Town, South Africa'
    },
    ratings: [],
    averageRating: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    token: 'mock-jwt-token-12345',
    user: mockUser
  };
};

/**
 * Mock update profile implementation
 */
export const updateProfile = async (data: Partial<User>, token: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get stored user (in a real app, this would be from API)
  const storedUserStr = await localStorage.getItem('user');
  let user: User;
  
  if (storedUserStr) {
    user = JSON.parse(storedUserStr);
    // Update user with new data
    user = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Fallback mock user if none exists
    user = {
      _id: '1',
      email: 'user@example.com',
      username: 'user123',
      fullName: 'Demo User',
      bio: data.bio || '',
      skills: data.skills || ['Cooking', 'Gardening'],
      talentBalance: 50,
      avatar: data.avatar || 'https://via.placeholder.com/150',
      phoneNumber: data.phoneNumber || '+27 123 456 789',
      location: data.location || {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Cape Town, South Africa'
      },
      ratings: [],
      averageRating: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  return user;
};

/**
 * Mock get profile implementation
 */
export const getProfile = async (token: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would fetch from API with the token
  return {
    _id: '1',
    email: 'user@example.com',
    username: 'user123',
    fullName: 'Demo User',
    bio: 'I love bartering in my community!',
    skills: ['Cooking', 'Gardening', 'Painting'],
    talentBalance: 50,
    avatar: 'https://via.placeholder.com/150',
    phoneNumber: '+27 123 456 789',
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249],
      address: 'Cape Town, South Africa'
    },
    ratings: [],
    averageRating: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Mock get user by ID implementation
 */
export const getUserById = async (userId: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    _id: userId,
    email: `user${userId}@example.com`,
    username: `user${userId}`,
    fullName: `User ${userId}`,
    bio: 'Community member',
    skills: ['Skill 1', 'Skill 2'],
    talentBalance: 30,
    avatar: 'https://via.placeholder.com/150',
    phoneNumber: '+27 123 456 789',
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249],
      address: 'Cape Town, South Africa'
    },
    ratings: [],
    averageRating: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Mock localStorage for React Native environment
const localStorage = {
  getItem: async (key: string) => {
    try {
      // In a real app, this would use AsyncStorage
      return null;
    } catch (e) {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // In a real app, this would use AsyncStorage
      return;
    } catch (e) {
      return;
    }
  }
};