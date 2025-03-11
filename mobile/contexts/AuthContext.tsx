import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthService from '../services/authService';
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
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load authentication data', e);
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
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      return true;
    } catch (e) {
      console.error('Logout error', e);
      return false;
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
      setError(error.message || 'Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
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