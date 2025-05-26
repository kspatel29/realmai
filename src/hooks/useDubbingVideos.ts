
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  uploadDubbingVideo, 
  getDubbingVideos, 
  getVideoUrl, 
  markVideoAsUsedInDubbing,
  DubbingVideo 
} from '@/services/dubbingVideoService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useDubbingVideos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['dubbing-videos', user?.id],
    queryFn: getDubbingVideos,
    enabled: !!user,
  });

  const uploadVideo = useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) => 
      uploadDubbingVideo(file, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dubbing-videos', user?.id] });
      toast.success('Video uploaded successfully for dubbing!');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const markAsUsed = useMutation({
    mutationFn: ({ videoId, dubbingJobId }: { videoId: string; dubbingJobId: string }) =>
      markVideoAsUsedInDubbing(videoId, dubbingJobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dubbing-videos', user?.id] });
    }
  });

  return {
    videos: videos || [],
    isLoading,
    error,
    uploadVideo,
    markAsUsed,
    getVideoUrl
  };
};
