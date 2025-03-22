
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { checkDubbingJobStatus } from '@/services/sieveApi';

export interface DubbingJob {
  id: string;
  user_id: string;
  sieve_job_id: string;
  status: string;
  languages: string[];
  created_at: string;
  updated_at: string;
  output_url?: string;
  error?: string;
}

export const useDubbingJobs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch user's dubbing jobs
  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ['dubbing-jobs', user?.id],
    queryFn: async (): Promise<DubbingJob[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('dubbing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching dubbing jobs:', error);
        toast.error('Failed to load dubbing jobs');
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  // Create a new dubbing job
  const createJob = useMutation({
    mutationFn: async (jobData: {
      sieve_job_id: string;
      status: string;
      languages: string[];
      output_url?: string;
      error?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('dubbing_jobs')
        .insert({
          user_id: user.id,
          sieve_job_id: jobData.sieve_job_id,
          status: jobData.status,
          languages: jobData.languages,
          output_url: jobData.output_url,
          error: jobData.error
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating dubbing job:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dubbing-jobs', user?.id] });
    },
  });

  // Update a dubbing job
  const updateJob = useMutation({
    mutationFn: async (jobData: {
      id: string;
      status: string;
      output_url?: string;
      error?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('dubbing_jobs')
        .update({
          status: jobData.status,
          output_url: jobData.output_url,
          error: jobData.error,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobData.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating dubbing job:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dubbing-jobs', user?.id] });
    },
  });

  // Refresh job statuses
  const refreshJobStatus = async () => {
    if (!user || !jobs || isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      const activeJobs = jobs.filter(job => 
        job.status === "queued" || job.status === "running"
      );
      
      if (activeJobs.length === 0) {
        setIsUpdating(false);
        return;
      }
      
      const updatedJobs = await Promise.all(
        activeJobs.map(async (job) => {
          try {
            const response = await checkDubbingJobStatus(job.sieve_job_id);
            
            // Check if the job failed with an error response
            if (response.status === "failed" || 
                (response.error && response.error.message) || 
                (response.status === "queued" && job.status === "running")) {
              // If the job is in a failed state, update it accordingly
              return updateJob.mutateAsync({
                id: job.id,
                status: "failed", // Ensure we mark it as failed even if API returns queued but has error
                output_url: response.outputs?.output_0?.url,
                error: response.error?.message || "Failed to process the video. The video might be inaccessible or the link expired."
              });
            }
            
            // Normal status update for non-error cases
            if (response.status !== job.status || 
                (response.status === "succeeded" && !job.output_url && response.outputs?.output_0?.url)) {
              
              return updateJob.mutateAsync({
                id: job.id,
                status: response.status,
                output_url: response.outputs?.output_0?.url,
                error: response.error?.message
              });
            }
            
            return job;
          } catch (error) {
            console.error(`Error checking job status for ${job.sieve_job_id}:`, error);
            
            // If the API call itself fails, mark the job as failed
            return updateJob.mutateAsync({
              id: job.id,
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error occurred while checking job status"
            });
          }
        })
      );
      
      if (updatedJobs.some(job => job !== jobs.find(j => j.id === job.id))) {
        refetch();
      }
    } catch (error) {
      console.error('Error refreshing job statuses:', error);
      toast.error('Failed to refresh job statuses');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    jobs: jobs || [],
    isLoading,
    error,
    createJob,
    updateJob,
    refreshJobStatus,
    isUpdating
  };
};
