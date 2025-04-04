import api, { handleApiError } from './api';
import { User, ApiResponse, PaginatedResponse } from '../types';
import config from '../config';

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock user data
      return {
        _id: id,
        username: 'user123',
        email: 'user@example.com',
        fullName: 'Sample User',
        skills: ['Sample skill'],
        talentBalance: 100,
        location: {
          type: 'Point',
          coordinates: [18.4241, -33.9249],
          address: 'Cape Town, South Africa'
        },
        ratings: [],
        averageRating: 4.5,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // Real API call
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch user');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get nearby users
 */
export const getNearbyUsers = async (
  longitude: number,
  latitude: number,
  maxDistance: number = 10000, // 10km default
  limit: number = 20
): Promise<PaginatedResponse<User>> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return mock data
      return {
        success: true,
        data: Array(5).fill(null).map((_, i) => ({
          _id: `user_${i}`,
          username: `user${i}`,
          email: `user${i}@example.com`,
          fullName: `User ${i}`,
          skills: ['Sample skill'],
          talentBalance: 100 + i * 10,
          location: {
            type: 'Point',
            coordinates: [18.4241 + (Math.random() - 0.5) * 0.1, -33.9249 + (Math.random() - 0.5) * 0.1],
            address: 'Near Cape Town, South Africa'
          },
          ratings: [],
          averageRating: 3 + Math.random() * 2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        count: 5,
        total: 5,
        page: 1,
        totalPages: 1
      };
    }
    
    // Real API call
    const response = await api.get<PaginatedResponse<User>>('/users/nearby', {
      params: {
        longitude,
        latitude,
        maxDistance,
        limit
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch nearby users');
    }

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
