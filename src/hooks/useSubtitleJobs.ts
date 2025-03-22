
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSubtitleJobs, SubtitleJob } from "@/services/api/subtitlesService";
import { toast } from "sonner";

export const useSubtitleJobs = () => {
  const queryClient = useQueryClient();

  const { 
    data: jobs, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['subtitle-jobs'],
    queryFn: fetchSubtitleJobs,
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
    refreshJobs
  };
};
