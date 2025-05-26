
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
}

export const useErrorBoundary = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack
    };

    setError(errorData);
    
    // Log to console for development
    console.error('Error captured:', error, errorInfo);
    
    // Show user-friendly toast
    toast.error('Something went wrong. Please try again.');
    
    // Could send to error reporting service here
    // reportError(errorData);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetErrorBoundary = useCallback(() => {
    setError(null);
    // Could trigger component re-render or navigation
  }, []);

  return {
    error,
    captureError,
    clearError,
    resetErrorBoundary,
    hasError: error !== null
  };
};

// Global error handler
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    toast.error('An unexpected error occurred');
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    toast.error('An unexpected error occurred');
  });
};
