
import { useState } from 'react';
import { checkDubbingJobStatus } from '@/services/api';
import { useUpdateDubbingJob } from './useUpdateDubbingJob';
import { DubbingJob } from './types';

export const useRefreshJobStatus = (jobs: DubbingJob[], refetch: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateJob } = useUpdateDubbingJob();

  const refreshJobStatus = async () => {
    if (!jobs || isUpdating) return;
    
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

  return { refreshJobStatus, isUpdating };
};
