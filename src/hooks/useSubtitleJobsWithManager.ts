
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { jobManager } from "@/services/jobManagerService";
import { fileManager } from "@/services/fileManagementService";
import { toast } from "sonner";

interface SubtitleJob {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  srt_url?: string;
  vtt_url?: string;
  preview_text?: string;
  language?: string;
  model_name: string;
  original_filename?: string;
  prediction_id?: string;
  error?: string;
}

export const useSubtitleJobsWithManager = () => {
  const queryClient = useQueryClient();

  const { 
    data: jobs, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['subtitle-jobs-with-manager'],
    queryFn: async (): Promise<SubtitleJob[]> => {
      const { data, error } = await supabase
        .from('subtitle_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createSubtitleJob = useMutation({
    mutationFn: async (jobData: {
      modelName: string;
      language?: string;
      originalFilename: string;
      audioUrl: string;
      userId: string;
    }) => {
      console.log('Creating subtitle job with data:', jobData);
      
      // Start the job using the job manager
      const jobId = await jobManager.startJob('subtitles', {
        userId: jobData.userId,
        modelName: jobData.modelName,
        language: jobData.language,
        originalFilename: jobData.originalFilename,
        predictionId: `pred_${Date.now()}` // Temporary until we get real prediction ID
      });

      return jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtitle-jobs-with-manager'] });
      toast.success('Subtitle job started successfully');
    },
    onError: (error) => {
      console.error('Error creating subtitle job:', error);
      toast.error('Failed to start subtitle job');
    }
  });

  const refreshJobs = async () => {
    try {
      await refetch();
      return true;
    } catch (error) {
      console.error("Error refreshing subtitle jobs:", error);
      toast.error("Failed to refresh subtitle jobs");
      return false;
    }
  };

  return {
    jobs: jobs || [],
    isLoading,
    error,
    refreshJobs,
    createSubtitleJob,
    isCreating: createSubtitleJob.isPending
  };
};
