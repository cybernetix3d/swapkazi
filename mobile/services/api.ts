import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, PaginatedResponse } from '../types';
import config from '../config';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API base URL:', config.apiUrl);

// Add request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from storage
    const token = await AsyncStorage.getItem('token');

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding auth token to request');
    } else {
      console.log('No auth token found for request');
    }

    console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    const originalRequest = error.config;

    // Handle token expiration (401 errors)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Unauthorized request - clearing auth data');
      originalRequest._retry = true;

      // Clear token and redirect to login
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      // We'll handle redirection in the AuthContext
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// API service with real implementation
const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> => {
    if (config?.enableMockData) {
      // Simulate delay for mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: {} as T };
    }

    const response: AxiosResponse<T> = await axiosInstance.get(url, config);
    return { data: response.data };
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{ data: T }> => {
    console.log(`API POST request to ${url}`, { data, config });

    if (config?.enableMockData) {
      // Simulate delay for mock data
      await new Promise(resolve => setTimeout(resolve, 700));
      console.log('Using mock data');
      return { data: {} as T };
    }

    try {
      console.log('Sending real API request...');
      const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
      console.log('API response received:', response.data);
      // The response.data is already the data we need
      return { data: response.data };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{ data: T }> => {
    if (config?.enableMockData) {
      // Simulate delay for mock data
      await new Promise(resolve => setTimeout(resolve, 600));
      return { data: {} as T };
    }

    const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
    return { data: response.data };
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> => {
    if (config?.enableMockData) {
      // Simulate delay for mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: {} as T };
    }

    const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
    return { data: response.data };
  }
};

// Error handling function
export const handleApiError = (error: any): string => {
  console.error('API Error:', error);

  // Handle axios errors
  if (error.response) {
    // Server responded with a status code outside of 2xx range
    return error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your internet connection.';
  } else if (typeof error === 'string') {
    return error;
  }

  return error?.message || 'An unexpected error occurred';
};

export default api;