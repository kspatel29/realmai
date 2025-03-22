
import { useFetchDubbingJobs } from './useFetchDubbingJobs';
import { useCreateDubbingJob } from './useCreateDubbingJob';
import { useUpdateDubbingJob } from './useUpdateDubbingJob';
import { useJobUrls } from './useJobUrls';
import { useRefreshJobStatus } from './useRefreshJobStatus';
import { DubbingJob } from './types';

export type { DubbingJob };

export const useDubbingJobs = () => {
  const { jobs, isLoading, error, refetch } = useFetchDubbingJobs();
  const { createJob } = useCreateDubbingJob();
  const { updateJob } = useUpdateDubbingJob();
  const { updateJobWithUrl } = useJobUrls(jobs);
  const { refreshJobStatus, isUpdating } = useRefreshJobStatus(jobs, refetch);

  return {
    jobs,
    isLoading,
    error,
    createJob,
    updateJob,
    refreshJobStatus,
    updateJobWithUrl,
    isUpdating,
    refetch
  };
};

export * from './types';
