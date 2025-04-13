import { User, RegisterData, AuthResponse } from '../types';
import api, { handleApiError } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

/**
 * Login implementation
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
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
    }

    // Use the regular login endpoint
    console.log('Using regular login endpoint with:', { email, password });
    const response = await api.post<AuthResponse>('/auth/login', { email, password });

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Register implementation
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
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
    }

    // Real API call
    const response = await api.post<AuthResponse>('/auth/register', userData);

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    console.log('Register response:', response.data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update profile implementation
 */
export const updateProfile = async (data: Partial<User>, token: string): Promise<User> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get stored user
      const storedUserStr = await AsyncStorage.getItem('user');
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
    }

    // Handle avatar upload if it's a local file URI
    let updatedData = { ...data };
    if (data.avatar && data.avatar.startsWith('file://')) {
      try {
        // Import the userService to use the uploadAvatar function
        const { uploadAvatar } = require('./userService');
        const avatarUrl = await uploadAvatar(data.avatar);
        updatedData.avatar = avatarUrl;
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        // Continue with profile update even if avatar upload fails
        // Remove the avatar field to prevent sending a local URI to the server
        delete updatedData.avatar;
      }
    }

    // Real API call
    const response = await api.put<User>('/users/profile', updatedData);

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get profile implementation
 */
export const getProfile = async (token: string): Promise<User> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Return mock user
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
    }

    // Real API call
    const response = await api.get<User>('/auth/me');

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get user by ID implementation
 */
export const getUserById = async (userId: string): Promise<User> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Return mock user
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
    }

    // Real API call
    const response = await api.get<User>(`/users/${userId}`);

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Validate token implementation
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    console.log('Validating token...');
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Always return true for mock data
      return true;
    }

    // Real API call - we'll use the /auth/me endpoint to validate the token
    // If the token is invalid, this will throw an error
    const response = await api.get<User>('/auth/me');

    // If we get here, the token is valid
    console.log('Token is valid');
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

/**
 * Rate a user implementation
 */
export const rateUser = async (userId: string, rating: number, comment?: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Return mock response
      return {
        success: true,
        message: 'Rating submitted successfully'
      };
    }

    // Real API call
    const response = await api.post<{ message: string; averageRating: number }>(`/users/${userId}/rate`, {
      rating,
      comment
    });

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};