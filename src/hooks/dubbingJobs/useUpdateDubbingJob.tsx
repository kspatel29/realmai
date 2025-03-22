
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useUpdateDubbingJob = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  return { updateJob };
};
