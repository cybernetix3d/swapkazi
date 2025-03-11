import { ApiResponse, PaginatedResponse } from '../types';

// Mock API service for development
const api = {
  get: async <T>(url: string, config?: any): Promise<{ data: T }> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This would normally call the actual API
    return {
      data: {} as T
    };
  },
  
  post: async <T>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // This would normally call the actual API
    return {
      data: {} as T
    };
  },
  
  put: async <T>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // This would normally call the actual API
    return {
      data: {} as T
    };
  },
  
  delete: async <T>(url: string, config?: any): Promise<{ data: T }> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This would normally call the actual API
    return {
      data: {} as T
    };
  }
};

// Error handling function
export const handleApiError = (error: any): string => {
  console.error('API Error:', error);
  if (typeof error === 'string') {
    return error;
  }
  return error?.message || 'An unexpected error occurred';
};

export default api;