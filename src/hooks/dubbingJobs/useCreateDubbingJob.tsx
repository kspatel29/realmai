
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DubbingJob } from './types';

export const useCreateDubbingJob = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  return { createJob };
};
