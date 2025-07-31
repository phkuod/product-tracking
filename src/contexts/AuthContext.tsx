import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, ApiError, AuthResponse, LoginCredentials } from '@/services/api';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  department: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start with true to show loading during initialization
    error: null,
  });

  // Debug state changes
  useEffect(() => {
    console.log('AuthProvider State:', state);
  }, [state]);

  // Simplified initialization - no complex async operations
  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Simple synchronous check without delays
    try {
      const token = localStorage.getItem('auth_token');
      console.log('AuthProvider: Token from localStorage:', token ? 'Found' : 'Not found');
      
      if (token) {
        // Try to parse user from token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('AuthProvider: Token payload:', payload);
          
          if (payload && payload.id && payload.exp > Date.now() / 1000) {
            console.log('AuthProvider: Valid token found, setting authenticated');
            setState({
              user: {
                id: payload.id,
                username: payload.username,
                name: payload.name,
                role: payload.role,
                department: payload.department,
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          } else {
            console.log('AuthProvider: Token expired or invalid');
          }
        } catch (tokenError) {
          console.log('AuthProvider: Invalid token, clearing:', tokenError);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
      }
      
      console.log('AuthProvider: No valid token, showing login');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('AuthProvider: Error during init:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    console.log('AuthProvider: Starting login...');
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const authResponse: AuthResponse = await apiService.login(credentials);
      console.log('AuthProvider: Login successful');
      
      setState({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('AuthProvider: Login failed:', error);
      let errorMessage = 'Login failed';
      
      if (error instanceof ApiError) {
        switch (error.type) {
          case 'authentication':
            errorMessage = 'Invalid username or password';
            break;
          case 'validation':
            errorMessage = 'Please check your input';
            break;
          case 'network_error':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'timeout_error':
            errorMessage = 'Request timed out. Please try again.';
            break;
          default:
            errorMessage = error.message;
        }
      }

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
    }
  };

  const logout = (): void => {
    console.log('AuthProvider: Logging out');
    apiService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const clearError = (): void => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  console.log('AuthProvider: Current state:', {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    hasUser: !!state.user,
    error: state.error
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};