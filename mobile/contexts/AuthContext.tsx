import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthService from '../services/authService';
import { router } from 'expo-router';
import { AuthContextType, User, RegisterData } from '../types';

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: async () => false,
  updateProfile: async () => false,
  refreshProfile: async () => false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize - check if user is already logged in
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          // Verify token is still valid
          try {
            // Attempt to validate token by making a request
            const isValid = await AuthService.validateToken(storedToken);

            if (isValid) {
              console.log('Token is valid, setting auth state');
              setToken(storedToken);
              // Make sure storedUser is valid JSON before parsing
              try {
                setUser(JSON.parse(storedUser));
              } catch (parseError) {
                console.error('Failed to parse stored user data', parseError);
                // Clear invalid data
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('token');
              }
            } else {
              console.log('Token is invalid, clearing auth state');
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('token');
            }
          } catch (tokenError) {
            console.error('Error validating token:', tokenError);
            // Clear potentially invalid token
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (e) {
        console.error('Failed to load authentication data', e);
        // Clear potentially corrupted data
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      const { token, user } = await AuthService.login(email, password);

      // Store auth data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      return true;
    } catch (e) {
      const error = e as Error;
      setError(error.message || 'Failed to login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      const { token, user } = await AuthService.register(userData);

      // Store auth data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      return true;
    } catch (e) {
      const error = e as Error;
      setError(error.message || 'Failed to register');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Clear stored auth data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      setToken(null);
      setUser(null);

      // Redirect to login screen
      router.replace('/(auth)/login');

      return true;
    } catch (e) {
      const error = e as Error;
      setError(error.message || 'Failed to logout');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!token) {
        throw new Error("Not authenticated");
      }

      setIsLoading(true);
      const updatedUser = await AuthService.updateProfile(data, token);

      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (e) {
      const error = e as Error;

      // Handle authentication errors
      if (error.message.includes('authentication') || error.message.includes('token')) {
        // Clear auth data and redirect to login
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.replace('/(auth)/login');
      }

      setError(error.message || 'Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user profile
  const refreshProfile = async (): Promise<boolean> => {
    try {
      if (!token) {
        return false;
      }

      const updatedUser = await AuthService.getProfile(token);

      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (e) {
      const error = e as Error;

      // Handle authentication errors
      if (error.message.includes('authentication') || error.message.includes('token')) {
        // Clear auth data and redirect to login
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.replace('/(auth)/login');
      }

      return false;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => useContext(AuthContext);