
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AnalyticsData {
  totalJobs: number;
  completedJobs: number;
  successRate: number;
  totalCreditsUsed: number;
  averageJobTime: number;
  mostUsedService: string;
  dailyUsage: Array<{
    date: string;
    jobs: number;
    credits: number;
  }>;
  serviceBreakdown: Array<{
    service: string;
    count: number;
    credits: number;
  }>;
}

export const useAdvancedAnalytics = (dateRange: { from: Date; to: Date }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['advanced-analytics', user?.id, dateRange],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user) throw new Error('User not authenticated');

      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();

      // Fetch all service usage logs
      const { data: usageLogs, error: usageError } = await supabase
        .from('service_usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      if (usageError) throw usageError;

      // Fetch dubbing jobs
      const { data: dubbingJobs, error: dubbingError } = await supabase
        .from('dubbing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      if (dubbingError) throw dubbingError;

      // Fetch subtitle jobs
      const { data: subtitleJobs, error: subtitleError } = await supabase
        .from('subtitle_jobs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      if (subtitleError) throw subtitleError;

      // Calculate analytics
      const allJobs = [
        ...dubbingJobs.map(job => ({ ...job, service: 'dubbing' })),
        ...subtitleJobs.map(job => ({ ...job, service: 'subtitles' })),
        ...usageLogs.filter(log => log.service_type === 'video_generation').map(log => ({ ...log, service: 'video_generation' }))
      ];

      const totalJobs = allJobs.length;
      const completedJobs = allJobs.filter(job => 
        job.status === 'completed' || job.status === 'succeeded'
      ).length;
      const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

      const totalCreditsUsed = usageLogs.reduce((sum, log) => sum + log.credits_used, 0);

      // Calculate average job time (simplified)
      const avgJobTime = allJobs.length > 0 ? 
        allJobs.reduce((sum, job) => {
          const created = new Date(job.created_at);
          const updated = new Date(job.updated_at || job.created_at);
          return sum + (updated.getTime() - created.getTime());
        }, 0) / allJobs.length / 1000 / 60 : 0; // in minutes

      // Service breakdown
      const serviceBreakdown = ['dubbing', 'subtitles', 'video_generation'].map(service => {
        const serviceJobs = allJobs.filter(job => job.service === service);
        const serviceCredits = usageLogs
          .filter(log => log.service_type === service)
          .reduce((sum, log) => sum + log.credits_used, 0);
        
        return {
          service,
          count: serviceJobs.length,
          credits: serviceCredits
        };
      });

      const mostUsedService = serviceBreakdown.reduce((max, current) => 
        current.count > max.count ? current : max, serviceBreakdown[0]
      ).service;

      // Daily usage (last 7 days within range)
      const dailyUsage = [];
      const dayMs = 24 * 60 * 60 * 1000;
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * dayMs);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayJobs = allJobs.filter(job => 
          job.created_at.startsWith(dateStr)
        ).length;
        
        const dayCredits = usageLogs
          .filter(log => log.created_at.startsWith(dateStr))
          .reduce((sum, log) => sum + log.credits_used, 0);

        dailyUsage.push({
          date: dateStr,
          jobs: dayJobs,
          credits: dayCredits
        });
      }

      return {
        totalJobs,
        completedJobs,
        successRate,
        totalCreditsUsed,
        averageJobTime: Math.round(avgJobTime),
        mostUsedService,
        dailyUsage,
        serviceBreakdown
      };
    },
    enabled: !!user
  });
};
