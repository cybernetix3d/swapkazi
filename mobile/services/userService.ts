import api, { handleApiError } from './api';
import { User, ApiResponse, PaginatedResponse, UpdateProfileData } from '../types';
import config from '../config';
import * as FileSystem from 'expo-file-system';

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

/**
 * Update user profile
 */
/**
 * Upload avatar image
 */
export const uploadAvatar = async (imageUri: string): Promise<string> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'https://example.com/avatar.jpg';
    }

    // Create form data for the image upload
    const formData = new FormData();

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    // Get file name and type
    const fileNameMatch = imageUri.match(/([^/]+)$/);
    const fileName = fileNameMatch ? fileNameMatch[1] : 'avatar.jpg';
    const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Append the file to form data
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: fileType,
    } as any);

    // Upload the image
    const response = await api.post<ApiResponse<{ fileUrl: string }>>('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success || !response.data.fileUrl) {
      throw new Error(response.data.message || 'Failed to upload avatar');
    }

    return response.data.fileUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData: UpdateProfileData): Promise<User> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Return mock updated user
      return {
        _id: 'mock_user_id',
        username: 'updated_username',
        email: 'user@example.com',
        fullName: profileData.fullName || 'Updated User',
        bio: profileData.bio || 'Updated bio',
        avatar: profileData.avatar || 'https://example.com/avatar.jpg',
        phoneNumber: profileData.phoneNumber || '+27123456789',
        skills: profileData.skills || ['Updated skill'],
        talentBalance: 100,
        location: profileData.location || {
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

    // If there's a local image URI in avatar, upload it first
    let updatedProfileData = { ...profileData };
    if (profileData.avatar && profileData.avatar.startsWith('file://')) {
      try {
        const avatarUrl = await uploadAvatar(profileData.avatar);
        updatedProfileData.avatar = avatarUrl;
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        // Continue with profile update even if avatar upload fails
      }
    }

    // Real API call
    const response = await api.put<User>('/users/profile', updatedProfileData);

    if (!response.data) {
      throw new Error('Failed to update profile');
    }

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
