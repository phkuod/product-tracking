import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>('theme', 'system');
  const [theme, setTheme] = useState<Theme>(storedTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Calculate actual theme based on preference
  const calculateActualTheme = (themePreference: Theme): 'light' | 'dark' => {
    if (themePreference === 'system') {
      return getSystemTheme();
    }
    return themePreference;
  };

  // Update theme
  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setStoredTheme(newTheme);
    const resolvedTheme = calculateActualTheme(newTheme);
    setActualTheme(resolvedTheme);
    
    // Update document class for Tailwind dark mode
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = () => {
    if (actualTheme === 'light') {
      updateTheme('dark');
    } else {
      updateTheme('light');
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newActualTheme = e.matches ? 'dark' : 'light';
        setActualTheme(newActualTheme);
        
        if (newActualTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Set initial theme
    updateTheme(theme);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    updateTheme(storedTheme);
  }, [storedTheme]);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme: updateTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme configuration for consistent colors
export const themeColors = {
  light: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    }
  },
  dark: {
    primary: {
      50: '#1e293b',
      100: '#334155',
      500: '#60a5fa',
      600: '#3b82f6',
      700: '#2563eb',
    },
    success: {
      50: '#064e3b',
      100: '#065f46',
      500: '#34d399',
      600: '#10b981',
      700: '#059669',
    },
    warning: {
      50: '#78350f',
      100: '#92400e',
      500: '#fbbf24',
      600: '#f59e0b',
      700: '#d97706',
    },
    danger: {
      50: '#7f1d1d',
      100: '#991b1b',
      500: '#f87171',
      600: '#ef4444',
      700: '#dc2626',
    },
    neutral: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    }
  }
};

// Status-specific colors for manufacturing context
export const statusColors = {
  normal: {
    light: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    dark: { bg: 'dark:bg-green-900/20', border: 'dark:border-green-800', text: 'dark:text-green-300' }
  },
  overdue: {
    light: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
    dark: { bg: 'dark:bg-red-900/20', border: 'dark:border-red-800', text: 'dark:text-red-300' }
  },
  warning: {
    light: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
    dark: { bg: 'dark:bg-yellow-900/20', border: 'dark:border-yellow-800', text: 'dark:text-yellow-300' }
  },
  info: {
    light: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    dark: { bg: 'dark:bg-blue-900/20', border: 'dark:border-blue-800', text: 'dark:text-blue-300' }
  }
};