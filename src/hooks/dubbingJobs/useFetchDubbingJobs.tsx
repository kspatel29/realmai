
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DubbingJob } from './types';

export const useFetchDubbingJobs = () => {
  const { user } = useAuth();

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

  return {
    jobs: jobs || [],
    isLoading,
    error,
    refetch
  };
};
