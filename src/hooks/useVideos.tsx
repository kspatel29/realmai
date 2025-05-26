
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Video {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  duration: number;
  aspect_ratio: string;
  video_url: string;
  thumbnail_url?: string;
  start_frame_url?: string;
  end_frame_url?: string;
  cost_credits: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useVideos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['video-clips', user?.id],
    queryFn: async (): Promise<Video[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('video_clips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching video clips:', error);
        toast.error('Failed to load video clips');
        throw error;
      }
      
      return data as Video[] || [];
    },
    enabled: !!user,
  });

  const uploadVideo = useMutation({
    mutationFn: async ({ 
      title, 
      prompt,
      duration = 5,
      aspectRatio = '16:9',
      videoUrl,
      thumbnailUrl,
      costCredits = 0
    }: { 
      title: string; 
      prompt: string;
      duration?: number;
      aspectRatio?: string;
      videoUrl: string;
      thumbnailUrl?: string;
      costCredits?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: videoRecord, error: videoError } = await supabase
        .from('video_clips')
        .insert({
          user_id: user.id,
          title,
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          cost_credits: costCredits,
          status: 'completed'
        })
        .select()
        .single();
      
      if (videoError) {
        console.error('Error creating video clip record:', videoError);
        throw videoError;
      }
      
      return videoRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-clips', user?.id] });
      toast.success('Video saved successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to save video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const deleteVideo = useMutation({
    mutationFn: async (videoId: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        // Delete the database record
        const { error: deleteError } = await supabase
          .from('video_clips')
          .delete()
          .eq('id', videoId)
          .eq('user_id', user.id);
        
        if (deleteError) {
          console.error('Error deleting video clip record:', deleteError);
          throw deleteError;
        }
        
        return videoId;
      } catch (error) {
        console.error('Error in deleteVideo mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-clips', user?.id] });
      toast.success('Video deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    videos,
    isLoading,
    error,
    uploadVideo,
    deleteVideo
  };
};
