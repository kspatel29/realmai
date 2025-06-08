
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AnalyticsData {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  successRate: number;
  totalCreditsUsed: number;
  averageJobTime: number;
  serviceBreakdown: Record<string, number>;
  timeSeriesData: Array<{
    date: string;
    jobs: number;
    credits: number;
  }>;
  recentActivity: Array<{
    id: string;
    service: string;
    status: string;
    created_at: string;
    credits_used?: number;
  }>;
}

export const useAdvancedAnalytics = () => {
  const { user } = useAuth();

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['advanced-analytics', user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user) throw new Error('User not authenticated');

      // Fetch dubbing jobs
      const { data: dubbingJobs, error: dubbingError } = await supabase
        .from('dubbing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dubbingError) throw dubbingError;

      // Fetch subtitle jobs
      const { data: subtitleJobs, error: subtitleError } = await supabase
        .from('subtitle_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (subtitleError) throw subtitleError;

      // Fetch service usage logs
      const { data: usageLogs, error: usageError } = await supabase
        .from('service_usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (usageError) throw usageError;

      // Transform data for analytics
      const allJobs = [
        ...(dubbingJobs || []).map(job => ({
          ...job,
          service: 'dubbing',
          credits_used: 15 // Estimated credits for dubbing
        })),
        ...(subtitleJobs || []).map(job => ({
          ...job,
          service: 'subtitles',
          credits_used: 10 // Estimated credits for subtitles
        }))
      ];

      const totalJobs = allJobs.length;
      const completedJobs = allJobs.filter(job => 
        job.status === 'completed' || job.status === 'succeeded'
      ).length;
      const failedJobs = allJobs.filter(job => 
        job.status === 'failed' || job.status === 'error'
      ).length;
      
      const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
      const totalCreditsUsed = (usageLogs || []).reduce((sum, log) => sum + log.credits_used, 0);

      // Calculate average job time (mock data for now)
      const averageJobTime = 45; // minutes

      // Service breakdown
      const serviceBreakdown = allJobs.reduce((acc, job) => {
        acc[job.service] = (acc[job.service] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Time series data (last 7 days)
      const timeSeriesData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayJobs = allJobs.filter(job => 
          job.created_at.startsWith(dateStr)
        ).length;
        
        const dayCredits = (usageLogs || []).filter(log => 
          log.created_at.startsWith(dateStr)
        ).reduce((sum, log) => sum + log.credits_used, 0);

        return {
          date: dateStr,
          jobs: dayJobs,
          credits: dayCredits
        };
      }).reverse();

      // Recent activity (safe access to updated_at)
      const recentActivity = allJobs.slice(0, 10).map(job => ({
        id: job.id,
        service: job.service,
        status: job.status,
        created_at: job.created_at,
        credits_used: job.credits_used
      }));

      return {
        totalJobs,
        completedJobs,
        failedJobs,
        successRate,
        totalCreditsUsed,
        averageJobTime,
        serviceBreakdown,
        timeSeriesData,
        recentActivity
      };
    },
    enabled: !!user,
  });

  return {
    data: analyticsData,
    isLoading,
    error
  };
};
