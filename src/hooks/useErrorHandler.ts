import { useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export interface ErrorHandlerOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
  logToService?: boolean;
  fallbackMessage?: string;
}

export function useErrorHandler() {
  const { addNotification } = useAppContext();

  const handleError = useCallback((
    error: Error | string,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showNotification = true,
      logToConsole = true,
      logToService = import.meta.env.PROD,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const fullContext = context ? `${context}: ${errorMessage}` : errorMessage;

    // Log to console in development
    if (logToConsole && import.meta.env.DEV) {
      console.group('🚨 Error Handler');
      console.error('Context:', context);
      console.error('Error:', error);
      console.error('Stack:', typeof error === 'object' ? error.stack : 'N/A');
      console.groupEnd();
    }

    // Show user notification
    if (showNotification) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage || fallbackMessage
      });
    }

    // Log to external service (in production)
    if (logToService) {
      logErrorToService(error, context);
    }

    return {
      message: errorMessage,
      context: fullContext
    };
  }, [addNotification]);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    context?: string,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error, context, options);
      return null;
    }
  }, [handleError]);

  const createErrorHandler = useCallback((
    context: string,
    options: ErrorHandlerOptions = {}
  ) => {
    return (error: Error | string) => handleError(error, context, options);
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    createErrorHandler
  };
}

// Utility function to log errors to external service
function logErrorToService(error: Error | string, context?: string) {
  const errorReport = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'object' ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: 'anonymous', // Replace with actual user ID in production
  };

  // In production, you would send this to an error tracking service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  console.warn('Error logged to service:', errorReport);
  
  // Example integration:
  // Sentry.captureException(error, { extra: errorReport });
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent the default browser behavior (logging to console)
    event.preventDefault();
    
    // Log to error service
    logErrorToService(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      'Unhandled Promise Rejection'
    );
  });

  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    
    logErrorToService(
      event.error || new Error(event.message),
      'Uncaught Error'
    );
  });

  // Handle React error boundaries globally
  window.addEventListener('react-error', ((event: CustomEvent) => {
    console.error('React error boundary:', event.detail);
    
    logErrorToService(
      event.detail.error,
      'React Error Boundary'
    );
  }) as EventListener);
}

// Validation helpers with error handling
export function validateRequired(value: any, fieldName: string): void {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} is required`);
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
}

export function validateRange(value: number, min: number, max: number, fieldName: string): void {
  if (value < min || value > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
}