
import { useState } from 'react';
import { verifyOutputUrl } from '@/services/api';
import { useUpdateDubbingJob } from './useUpdateDubbingJob';
import { DubbingJob } from './types';

export const useJobUrls = (jobs: DubbingJob[]) => {
  const { updateJob } = useUpdateDubbingJob();
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);

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
    updateJobWithUrl,
    forceUpdateWithUrl,
    isUpdatingUrl,
    setIsUpdatingUrl
  };
};
