import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  showLabel?: boolean;
  variant?: 'icon' | 'dropdown';
}

export function ThemeToggle({ showLabel = false, variant = 'icon' }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="w-9 h-9 p-0 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {actualTheme === 'light' ? (
          <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        )}
        {showLabel && (
          <span className="ml-2 text-sm">
            {actualTheme === 'light' ? 'Dark' : 'Light'}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === 'light'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Sun className="w-4 h-4" />
          {showLabel && <span>Light</span>}
        </button>
        
        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Moon className="w-4 h-4" />
          {showLabel && <span>Dark</span>}
        </button>
        
        <button
          onClick={() => setTheme('system')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === 'system'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Monitor className="w-4 h-4" />
          {showLabel && <span>System</span>}
        </button>
      </div>
    </div>
  );
}

// Animated theme transition component
export function ThemeTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="transition-colors duration-200 ease-in-out">
      {children}
    </div>
  );
}