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

        console.log('Stored token exists:', !!storedToken);
        console.log('Stored user exists:', !!storedUser);

        if (storedToken && storedUser) {
          // Clean up the token (remove any whitespace)
          const cleanToken = storedToken.trim();

          // Verify token is still valid
          try {
            // Attempt to validate token by making a request
            console.log('Validating token...');
            const isValid = await AuthService.validateToken(cleanToken);

            if (isValid) {
              console.log('Token is valid, setting auth state');
              setToken(cleanToken);
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
        } else {
          console.log('No stored authentication data found');
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

      if (!token) {
        throw new Error('No token received from server');
      }

      console.log('Login successful, received token');

      // Clean the token and store auth data
      const cleanToken = token.trim();
      await AsyncStorage.setItem('token', cleanToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setToken(cleanToken);
      setUser(user);
      return true;
    } catch (e) {
      const error = e as Error;
      console.error('Login error:', error);
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

      if (!token) {
        throw new Error('No token received from server');
      }

      console.log('Registration successful, received token');

      // Clean the token and store auth data
      const cleanToken = token.trim();
      await AsyncStorage.setItem('token', cleanToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setToken(cleanToken);
      setUser(user);
      return true;
    } catch (e) {
      const error = e as Error;
      console.error('Registration error:', error);
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
      console.log('Updating profile with data:', data);
      const updatedUser = await AuthService.updateProfile(data, token);

      console.log('Profile updated successfully:', updatedUser);

      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // Update the user state to trigger UI updates
      setUser(prevUser => {
        if (!prevUser) return updatedUser;
        return { ...prevUser, ...updatedUser };
      });

      // Force a refresh of the profile to ensure we have the latest data
      setTimeout(() => refreshProfile(), 500);

      return true;
    } catch (e) {
      const error = e as Error;
      console.error('Profile update error:', error);

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
        console.log('Cannot refresh profile: No token available');
        return false;
      }

      console.log('Refreshing user profile...');
      const updatedUser = await AuthService.getProfile(token);

      if (!updatedUser) {
        console.error('Failed to get updated user profile');
        return false;
      }

      console.log('Profile refreshed successfully:', updatedUser);

      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // Update the user state to trigger UI updates
      setUser(updatedUser);
      return true;
    } catch (e) {
      const error = e as Error;
      console.error('Profile refresh error:', error);

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