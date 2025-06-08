
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
}

interface ErrorLog {
  message: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: string;
  userAgent: string;
  url: string;
}

export const useErrorHandler = () => {
  const logError = useCallback((error: Error, context?: ErrorContext) => {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console for development
    console.error('Error logged:', errorLog);

    // In production, you would send this to an error monitoring service
    // Example: Sentry, LogRocket, or custom error tracking
    
    return errorLog;
  }, []);

  const handleError = useCallback((
    error: Error, 
    context?: ErrorContext,
    showToast = true
  ) => {
    // Log the error
    logError(error, context);

    // Show user-friendly message
    if (showToast) {
      const userMessage = getUserFriendlyMessage(error, context);
      toast.error(userMessage);
    }
  }, [logError]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext,
    fallbackValue?: T
  ): Promise<T | undefined> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return fallbackValue;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    logError
  };
};

function getUserFriendlyMessage(error: Error, context?: ErrorContext): string {
  // Network errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Authentication errors
  if (error.message.includes('auth') || error.message.includes('unauthorized')) {
    return 'Authentication error. Please sign in again.';
  }

  // Payment errors
  if (error.message.includes('payment') || error.message.includes('stripe')) {
    return 'Payment processing error. Please try again or contact support.';
  }

  // File upload errors
  if (error.message.includes('upload') || error.message.includes('file')) {
    return 'File upload failed. Please check the file size and format.';
  }

  // API quota errors
  if (error.message.includes('quota') || error.message.includes('limit')) {
    return 'Service limit reached. Please try again later or upgrade your plan.';
  }

  // Context-specific messages
  if (context?.component) {
    switch (context.component) {
      case 'VideoDubbing':
        return 'Video processing failed. Please try uploading a different video.';
      case 'Subtitles':
        return 'Subtitle generation failed. Please try again with a different video.';
      case 'ClipsGenerator':
        return 'Clip generation failed. Please try again or contact support.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
}
