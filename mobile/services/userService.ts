import api, { handleApiError } from './api';
import { User, ApiResponse, PaginatedResponse, UpdateProfileData } from '../types';
import config from '../config';
import * as FileSystem from 'expo-file-system';

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
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

    try {
      // Real API call
      const response = await api.get<{ success: boolean, data: User }>(`/users/${id}`);

      // The server returns { success: true, data: User }
      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      // Try alternative response format
      if (response.data && typeof response.data === 'object' && '_id' in response.data) {
        return response.data as User;
      }

      console.log('User not found or invalid response format');
      return null;
    } catch (apiError) {
      console.error('API error in getUserById:', apiError);

      // Create a basic user object with the ID and a placeholder name
      return {
        _id: id,
        username: `user_${id.substring(0, 5)}`,
        email: '',
        fullName: `User ${id.substring(0, 5)}...`,
        skills: [],
        talentBalance: 0,
        location: {
          type: 'Point',
          coordinates: [0, 0],
          address: ''
        },
        ratings: [],
        averageRating: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
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
    const response = await api.get<User[]>('/users/nearby', {
      params: {
        longitude,
        latitude,
        maxDistance,
        limit
      }
    });

    // Check if the response is already in the expected format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data;
    }

    // If not, create a paginated response from the array
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
      count: Array.isArray(response.data) ? response.data.length : 0,
      total: Array.isArray(response.data) ? response.data.length : 0,
      page: 1,
      totalPages: 1
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get all users (with optional search query)
 */
export const getUsers = async (searchQuery?: string): Promise<User[]> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate mock users
      const mockUsers = Array(10).fill(null).map((_, i) => ({
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
      }));

      // Filter by search query if provided
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return mockUsers.filter(user =>
          user.fullName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query)
        );
      }

      return mockUsers;
    }

    // Real API call
    const response = await api.get<User[]>('/users', {
      params: searchQuery ? { search: searchQuery } : {}
    });

    // Check if the response is already in the expected format
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      return response.data.data;
    }

    // If the server returns the users array directly
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Search users by name or username
 */
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate mock search results
      const mockUsers = Array(5).fill(null).map((_, i) => ({
        _id: `search_${i}`,
        username: `user_${query}_${i}`,
        email: `user${i}@example.com`,
        fullName: `${query.charAt(0).toUpperCase() + query.slice(1)} User ${i}`,
        skills: ['Coding', 'Design', 'Gardening'],
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
      }));

      return mockUsers;
    }

    // Real API call
    const response = await api.get<ApiResponse<User[]>>('/users/search', {
      params: { query }
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to search users');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

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
    const response = await api.post<{success: boolean, data: { fileUrl: string }}>('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data || !response.data.success || !response.data.data || !response.data.data.fileUrl) {
      throw new Error((response.data && response.data.message) || 'Failed to upload avatar');
    }

    console.log('Avatar upload response:', response.data);
    return response.data.data.fileUrl;
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
    const response = await api.put<{success: boolean, data: User}>('/users/profile', updatedProfileData);

    if (!response.data || !response.data.success || !response.data.data) {
      throw new Error('Failed to update profile');
    }

    console.log('Profile update response from server:', response.data);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Change user password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate validation (in a real app, this would be done on the server)
      if (currentPassword === 'wrongpassword') {
        throw new Error('Current password is incorrect');
      }

      return true;
    }

    // Real API call
    const response = await api.put<ApiResponse<any>>('/users/password', {
      currentPassword,
      newPassword
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to change password');
    }

    return true;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};