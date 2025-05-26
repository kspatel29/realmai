
import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTimes: Record<string, number>;
  errorCount: number;
  userSessionDuration: number;
  memoryUsage: number;
  networkLatency: number;
}

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  timestamp: string;
  userId?: string;
  url: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down';
  authentication: 'healthy' | 'degraded' | 'down';
  payments: 'healthy' | 'degraded' | 'down';
  aiServices: 'healthy' | 'degraded' | 'down';
  overall: 'healthy' | 'degraded' | 'down';
}

export const useProductionMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiResponseTimes: {},
    errorCount: 0,
    userSessionDuration: 0,
    memoryUsage: 0,
    networkLatency: 0
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    authentication: 'healthy',
    payments: 'healthy',
    aiServices: 'healthy',
    overall: 'healthy'
  });

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Track performance metrics
  const trackPerformance = useCallback(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      setMetrics(prev => ({
        ...prev,
        pageLoadTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      }));
    }
  }, []);

  // Log errors for monitoring
  const logError = useCallback(async (error: Error, severity: ErrorLog['severity'] = 'medium') => {
    const errorLog: ErrorLog = {
      id: crypto.randomUUID(),
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity
    };

    setErrorLogs(prev => [errorLog, ...prev].slice(0, 100)); // Keep last 100 errors

    // In production, send to monitoring service
    try {
      await supabase.functions.invoke('log-error', {
        body: errorLog
      });
    } catch (e) {
      console.error('Failed to log error to monitoring service:', e);
    }

    if (severity === 'critical') {
      toast.error('Critical error detected and logged');
    }
  }, []);

  // Track API response times
  const trackApiCall = useCallback((endpoint: string, duration: number, success: boolean) => {
    setMetrics(prev => ({
      ...prev,
      apiResponseTimes: {
        ...prev.apiResponseTimes,
        [endpoint]: duration
      },
      errorCount: success ? prev.errorCount : prev.errorCount + 1
    }));

    // Alert on slow API calls
    if (duration > 5000) {
      console.warn(`Slow API call detected: ${endpoint} took ${duration}ms`);
    }

    // Alert on high error rates
    const totalCalls = Object.keys(prev.apiResponseTimes).length;
    const errorRate = prev.errorCount / totalCalls;
    if (errorRate > 0.1) { // 10% error rate
      toast.warning('High error rate detected in API calls');
    }
  }, []);

  // Check system health
  const checkSystemHealth = useCallback(async () => {
    const healthChecks = {
      database: 'healthy' as SystemHealth['database'],
      authentication: 'healthy' as SystemHealth['authentication'],
      payments: 'healthy' as SystemHealth['payments'],
      aiServices: 'healthy' as SystemHealth['aiServices']
    };

    try {
      // Test database connection
      const { error: dbError } = await supabase.from('user_credits').select('count').limit(1);
      if (dbError) healthChecks.database = 'degraded';

      // Test authentication
      const { error: authError } = await supabase.auth.getSession();
      if (authError) healthChecks.authentication = 'degraded';

      // Test payment system (simplified check)
      try {
        await fetch('/api/health/payments');
      } catch {
        healthChecks.payments = 'degraded';
      }

      // Test AI services (simplified check)
      try {
        await fetch('/api/health/ai-services');
      } catch {
        healthChecks.aiServices = 'degraded';
      }

    } catch (error) {
      console.error('Health check failed:', error);
    }

    // Determine overall health
    const degradedServices = Object.values(healthChecks).filter(status => status !== 'healthy').length;
    const overall: SystemHealth['overall'] = 
      degradedServices === 0 ? 'healthy' :
      degradedServices <= 2 ? 'degraded' : 'down';

    setSystemHealth({
      ...healthChecks,
      overall
    });

    return { ...healthChecks, overall };
  }, []);

  // Monitor user session
  const monitorSession = useCallback(() => {
    const sessionStart = Date.now();
    
    const updateSessionDuration = () => {
      setMetrics(prev => ({
        ...prev,
        userSessionDuration: Date.now() - sessionStart
      }));
    };

    const interval = setInterval(updateSessionDuration, 30000); // Update every 30 seconds

    // Clean up on page unload
    const handleUnload = () => {
      clearInterval(interval);
      updateSessionDuration();
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    
    // Track initial performance
    trackPerformance();
    
    // Start session monitoring
    const cleanup = monitorSession();
    
    // Set up periodic health checks
    const healthCheckInterval = setInterval(checkSystemHealth, 60000); // Every minute
    
    // Set up error handling
    const handleGlobalError = (event: ErrorEvent) => {
      logError(new Error(event.message), 'high');
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(new Error(event.reason), 'high');
    };
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      setIsMonitoring(false);
      cleanup();
      clearInterval(healthCheckInterval);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isMonitoring, trackPerformance, monitorSession, checkSystemHealth, logError]);

  // Get monitoring summary
  const getMonitoringSummary = useCallback(() => {
    const avgApiResponseTime = Object.values(metrics.apiResponseTimes).reduce((a, b) => a + b, 0) / 
                               Object.values(metrics.apiResponseTimes).length || 0;
    
    const criticalErrors = errorLogs.filter(log => log.severity === 'critical').length;
    const recentErrors = errorLogs.filter(log => 
      Date.now() - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000
    ).length;

    return {
      systemHealth: systemHealth.overall,
      avgApiResponseTime: Math.round(avgApiResponseTime),
      pageLoadTime: Math.round(metrics.pageLoadTime),
      criticalErrors,
      recentErrors,
      sessionDuration: Math.round(metrics.userSessionDuration / 1000), // in seconds
      memoryUsage: Math.round(metrics.memoryUsage / 1024 / 1024), // in MB
    };
  }, [metrics, systemHealth, errorLogs]);

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    metrics,
    systemHealth,
    errorLogs,
    isMonitoring,
    logError,
    trackApiCall,
    checkSystemHealth,
    getMonitoringSummary,
    startMonitoring
  };
};
