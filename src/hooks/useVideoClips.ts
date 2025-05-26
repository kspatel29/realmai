
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserVideoClips, saveVideoClip, deleteVideoClip, VideoClip } from '@/services/videoClipsService';
import { toast } from 'sonner';

export const useVideoClips = () => {
  const queryClient = useQueryClient();

  const { data: clips = [], isLoading, error, refetch } = useQuery({
    queryKey: ['video-clips'],
    queryFn: getUserVideoClips,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const saveClipMutation = useMutation({
    mutationFn: saveVideoClip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-clips'] });
      toast.success("Video clip saved to history");
    },
    onError: (error) => {
      console.error('Error saving clip:', error);
      toast.error("Failed to save video clip");
    }
  });

  const deleteClipMutation = useMutation({
    mutationFn: deleteVideoClip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-clips'] });
      toast.success("Video clip deleted");
    },
    onError: (error) => {
      console.error('Error deleting clip:', error);
      toast.error("Failed to delete video clip");
    }
  });

  return {
    clips,
    isLoading,
    error,
    refetch,
    saveClip: saveClipMutation.mutate,
    deleteClip: deleteClipMutation.mutate,
    isSaving: saveClipMutation.isPending,
    isDeleting: deleteClipMutation.isPending
  };
};
