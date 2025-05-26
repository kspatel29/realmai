
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

export const usePerformanceMonitor = () => {
  const queryClient = useQueryClient();

  const trackMetric = useCallback((name: string, value: number) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href
    };

    console.log(`Performance metric: ${name} = ${value}ms`);
    
    // In production, send to analytics service
    // Example: Google Analytics, Mixpanel, or custom analytics
  }, []);

  const trackPageLoad = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        trackMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
        trackMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        trackMetric('first_contentful_paint', navigation.loadEventEnd - navigation.fetchStart);
      }
    }
  }, [trackMetric]);

  const trackUserInteraction = useCallback((action: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    trackMetric(`user_interaction_${action}`, duration);
  }, [trackMetric]);

  const trackApiCall = useCallback((endpoint: string, duration: number, success: boolean) => {
    trackMetric(`api_call_${endpoint}_duration`, duration);
    trackMetric(`api_call_${endpoint}_${success ? 'success' : 'error'}`, 1);
  }, [trackMetric]);

  const optimizeCache = useCallback(() => {
    // Clear stale queries older than 10 minutes
    queryClient.getQueryCache().getAll().forEach(query => {
      const lastUpdated = query.state.dataUpdatedAt;
      if (lastUpdated && Date.now() - lastUpdated > 10 * 60 * 1000) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }, [queryClient]);

  useEffect(() => {
    // Track initial page load
    trackPageLoad();

    // Set up cache optimization interval
    const cacheInterval = setInterval(optimizeCache, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      clearInterval(cacheInterval);
    };
  }, [trackPageLoad, optimizeCache]);

  return {
    trackMetric,
    trackUserInteraction,
    trackApiCall,
    optimizeCache
  };
};
