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
    isLoading: true,
    error: null,
  });

  // Check if user is already authenticated on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Add timeout protection for initialization
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timeout')), 5000);
        });

        const initPromise = new Promise<void>((resolve) => {
          try {
            if (apiService.isAuthenticated()) {
              const currentUser = apiService.getCurrentUser();
              if (currentUser && currentUser.id) {
                setState({
                  user: {
                    id: currentUser.id,
                    username: currentUser.username,
                    name: currentUser.name,
                    role: currentUser.role,
                    department: currentUser.department,
                  },
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });
                resolve();
                return;
              }
            }
            
            // Clear any invalid tokens
            apiService.logout();
            
            setState(prev => ({
              ...prev,
              isLoading: false,
              isAuthenticated: false,
              user: null,
              error: null,
            }));
            resolve();
          } catch (error) {
            console.error('Auth initialization error:', error);
            // Clear tokens and reset state on any error
            apiService.logout();
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            resolve();
          }
        });

        await Promise.race([initPromise, timeoutPromise]);
      } catch (error) {
        console.error('Auth initialization timeout or error:', error);
        // Force reset on timeout
        apiService.logout();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const authResponse: AuthResponse = await apiService.login(credentials);
      
      setState({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};