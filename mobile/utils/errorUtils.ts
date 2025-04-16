/**
 * Error Handling Utilities
 * 
 * This file contains utility functions for handling errors in the app.
 */

import { Alert } from 'react-native';

/**
 * Format an error message from various error types
 * @param error The error object
 * @returns A formatted error message
 */
export const formatErrorMessage = (error: any): string => {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  // If it's a string, return it directly
  if (typeof error === 'string') {
    return error;
  }
  
  // If it's an Error object
  if (error instanceof Error) {
    return error.message || 'An error occurred';
  }
  
  // If it's an API error with a message property
  if (error.message) {
    return error.message;
  }
  
  // If it's an API error with a response
  if (error.response) {
    // Try to get the error message from the response data
    const responseData = error.response.data;
    
    if (responseData) {
      if (typeof responseData === 'string') {
        return responseData;
      }
      
      if (responseData.message) {
        return responseData.message;
      }
      
      if (responseData.error) {
        return responseData.error;
      }
    }
    
    // If we couldn't extract a message, use the status text
    return `Error ${error.response.status}: ${error.response.statusText || 'Unknown error'}`;
  }
  
  // If all else fails, stringify the error
  try {
    return JSON.stringify(error);
  } catch (e) {
    return 'An unknown error occurred';
  }
};

/**
 * Show an error alert with a formatted error message
 * @param error The error object
 * @param title The alert title (default: 'Error')
 */
export const showErrorAlert = (error: any, title: string = 'Error'): void => {
  const message = formatErrorMessage(error);
  Alert.alert(title, message);
};

/**
 * Handle an API error with a callback
 * @param error The error object
 * @param callback A callback function to execute after handling the error
 */
export const handleApiError = (error: any, callback?: () => void): void => {
  showErrorAlert(error);
  
  if (callback) {
    callback();
  }
};

/**
 * Try to execute a function and handle any errors
 * @param fn The function to execute
 * @param errorHandler The error handler function
 * @returns The result of the function or undefined if an error occurred
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>,
  errorHandler?: (error: any) => void
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      showErrorAlert(error);
    }
    return undefined;
  }
};
