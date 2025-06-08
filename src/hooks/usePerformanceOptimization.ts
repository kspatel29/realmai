
import { useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Debounce hook for performance optimization
export const useDebounce = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Throttle hook for performance optimization
export const useThrottle = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const lastRun = useRef(Date.now());

  const throttledCallback = useCallback(
    (...args: T) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay]
  );

  return throttledCallback;
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) => {
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      options
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);

  return targetRef;
};

// Cache management for better performance
export const useCacheOptimization = () => {
  const queryClient = useQueryClient();

  const prefetchQuery = useCallback(
    (queryKey: string[], queryFn: () => Promise<any>) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
    [queryClient]
  );

  const invalidateQueries = useCallback(
    (queryKey: string[]) => {
      queryClient.invalidateQueries({ queryKey });
    },
    [queryClient]
  );

  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  return {
    prefetchQuery,
    invalidateQueries,
    clearCache
  };
};
