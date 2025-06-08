
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobManager, JobProgressCallback } from "@/services/jobManagerService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UnifiedJob {
  id: string;
  type: 'dubbing' | 'subtitles' | 'video_generation';
  status: string;
  created_at: string;
  updated_at?: string;
  metadata?: any;
  error?: string;
}

export const useUnifiedJobManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: allJobs, isLoading } = useQuery({
    queryKey: ['unified-jobs', user?.id],
    queryFn: async (): Promise<UnifiedJob[]> => {
      if (!user) return [];

      try {
        // Fetch all job types in parallel
        const [dubbingJobs, subtitleJobs, serviceUsageLogs] = await Promise.all([
          supabase.from('dubbing_jobs').select('*').eq('user_id', user.id),
          supabase.from('subtitle_jobs').select('*').eq('user_id', user.id),
          supabase.from('service_usage_logs').select('*').eq('user_id', user.id).eq('service_type', 'video_generation')
        ]);

        const jobs: UnifiedJob[] = [];

        // Add dubbing jobs
        if (dubbingJobs.data) {
          jobs.push(...dubbingJobs.data.map(job => ({
            id: job.id,
            type: 'dubbing' as const,
            status: job.status,
            created_at: job.created_at,
            updated_at: job.updated_at,
            metadata: { languages: job.languages, sieve_job_id: job.sieve_job_id },
            error: job.error
          })));
        }

        // Add subtitle jobs
        if (subtitleJobs.data) {
          jobs.push(...subtitleJobs.data.map(job => ({
            id: job.id,
            type: 'subtitles' as const,
            status: job.status,
            created_at: job.created_at,
            updated_at: job.updated_at,
            metadata: { 
              model_name: job.model_name, 
              language: job.language,
              original_filename: job.original_filename
            },
            error: job.error
          })));
        }

        // Add video generation jobs
        if (serviceUsageLogs.data) {
          jobs.push(...serviceUsageLogs.data.map(job => ({
            id: job.id,
            type: 'video_generation' as const,
            status: job.status || 'pending',
            created_at: job.created_at,
            metadata: job.metadata
          })));
        }

        // Sort by creation date (newest first)
        return jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      } catch (error) {
        console.error('Error fetching unified jobs:', error);
        return [];
      }
    },
    enabled: !!user
  });

  const startJob = useMutation({
    mutationFn: async ({
      type,
      jobData,
      onProgress
    }: {
      type: 'dubbing' | 'subtitles' | 'video_generation';
      jobData: any;
      onProgress?: JobProgressCallback;
    }) => {
      if (!user) throw new Error('User must be authenticated');

      return await jobManager.startJob(type, { ...jobData, userId: user.id }, onProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-jobs'] });
    },
    onError: (error) => {
      console.error('Job start error:', error);
      toast.error(`Failed to start job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const cancelJob = useMutation({
    mutationFn: async (jobId: string) => {
      jobManager.cancelJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-jobs'] });
      toast.success('Job cancelled successfully');
    }
  });

  const refreshJobs = async () => {
    await queryClient.invalidateQueries({ queryKey: ['unified-jobs'] });
  };

  return {
    allJobs: allJobs || [],
    isLoading,
    startJob,
    cancelJob,
    refreshJobs,
    isStartingJob: startJob.isPending
  };
};
