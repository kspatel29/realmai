import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { checkDubbingJobStatus, verifyOutputUrl } from '@/services/api';

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

  const updateJob = useMutation({
    mutationFn: async (jobData: {
      id: string;
      status: string;
      output_url?: string;
      error?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log(`Updating job ${jobData.id} with status: ${jobData.status}, output_url: ${jobData.output_url}`);
      
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
      
      console.log(`Successfully updated job ${jobData.id}:`, data);
      return data;
    },
    onSuccess: (data) => {
      console.log(`Job update mutation succeeded:`, data);
      queryClient.invalidateQueries({ queryKey: ['dubbing-jobs', user?.id] });
      
      if (data.status === "succeeded" && data.output_url) {
        toast.success("Your video has been successfully dubbed!");
      } else if (data.status === "failed") {
        toast.error(`Dubbing failed: ${data.error || "Unknown error"}`);
      }
    },
  });

  const forceUpdateWithUrl = async (jobId: string, outputUrl: string) => {
    try {
      const isValid = await verifyOutputUrl(outputUrl);
      
      if (isValid) {
        console.log(`Force updating job ${jobId} with verified output URL: ${outputUrl}`);
        
        await updateJob.mutateAsync({
          id: jobId,
          status: "succeeded",
          output_url: outputUrl,
          error: null
        });
        
        return true;
      } else {
        console.error(`Output URL verification failed for ${outputUrl}`);
        return false;
      }
    } catch (error) {
      console.error(`Error in force update for job ${jobId}:`, error);
      return false;
    }
  };

  const refreshJobStatus = async () => {
    if (!user || !jobs || isUpdating) return;
    
    setIsUpdating(true);
    console.log("Starting refresh of job statuses");
    
    try {
      const jobsWithUrlNotSucceeded = jobs.filter(job => 
        job.output_url && job.status !== "succeeded"
      );
      
      if (jobsWithUrlNotSucceeded.length > 0) {
        console.log(`Found ${jobsWithUrlNotSucceeded.length} jobs with URLs that aren't marked succeeded`);
        
        for (const job of jobsWithUrlNotSucceeded) {
          await updateJob.mutateAsync({
            id: job.id,
            status: "succeeded",
            output_url: job.output_url,
            error: null
          });
        }
      }
      
      const activeJobs = jobs.filter(job => 
        (job.status === "queued" || job.status === "running") && !job.output_url
      );
      
      if (activeJobs.length === 0) {
        console.log("No active jobs to refresh");
        setIsUpdating(false);
        return;
      }
      
      console.log(`Refreshing statuses for ${activeJobs.length} active jobs`);
      
      const updatedJobs = await Promise.all(
        activeJobs.map(async (job) => {
          try {
            console.log(`Checking status for job ${job.sieve_job_id}`);
            const response = await checkDubbingJobStatus(job.sieve_job_id);
            console.log(`Job ${job.sieve_job_id} API status:`, response.status, 
              "Output URL:", response.outputs?.output_0?.url);
            
            if (response.outputs?.output_0?.url) {
              console.log(`Job ${job.sieve_job_id} has output URL, marking as succeeded`);
              return updateJob.mutateAsync({
                id: job.id,
                status: "succeeded",
                output_url: response.outputs.output_0.url,
                error: null
              });
            }
            
            if (response.status === "failed" || response.error?.message) {
              console.log(`Job ${job.sieve_job_id} has failed:`, response.error?.message);
              return updateJob.mutateAsync({
                id: job.id,
                status: "failed",
                error: response.error?.message || "Failed to process the video"
              });
            }
            
            if (response.status !== job.status) {
              console.log(`Job ${job.sieve_job_id} status changed from ${job.status} to ${response.status}`);
              return updateJob.mutateAsync({
                id: job.id,
                status: response.status,
                error: null
              });
            }
            
            return job;
          } catch (error) {
            console.error(`Error checking job status for ${job.sieve_job_id}:`, error);
            
            return job;
          }
        })
      );
      
      if (updatedJobs.some(job => job !== jobs.find(j => j.id === job.id))) {
        console.log("Some jobs were updated, refreshing job list");
        refetch();
      }
    } catch (error) {
      console.error('Error refreshing job statuses:', error);
      toast.error('Failed to refresh job statuses');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateJobWithUrl = async (sieveJobId: string, outputUrl: string) => {
    if (!jobs) return false;
    
    const job = jobs.find(j => j.sieve_job_id === sieveJobId);
    if (!job) {
      console.error(`No job found with sieve_job_id ${sieveJobId}`);
      return false;
    }
    
    return forceUpdateWithUrl(job.id, outputUrl);
  };

  return {
    jobs: jobs || [],
    isLoading,
    error,
    createJob,
    updateJob,
    refreshJobStatus,
    updateJobWithUrl,
    isUpdating
  };
};
