
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface VideoAnalytics {
  id: string;
  user_id: string;
  video_id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  watch_time: number;
  created_at: string;
  updated_at: string;
}

export const useYouTubeAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch user's video analytics
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['video-analytics', user?.id],
    queryFn: async (): Promise<VideoAnalytics[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('video_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching video analytics:', error);
        toast.error('Failed to load video analytics');
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  // Mock function to simulate fetching YouTube analytics
  // In a real app, this would connect to the YouTube API
  const fetchYouTubeStats = async () => {
    // Demo data to simulate YouTube API response
    const mockVideos = [
      {
        video_id: 'video1',
        title: 'How I Made $100K in One Day',
        views: 125000 + Math.floor(Math.random() * 10000),
        likes: 15400 + Math.floor(Math.random() * 1000),
        comments: 1200 + Math.floor(Math.random() * 100),
        watch_time: 345600 + Math.floor(Math.random() * 10000),
      },
      {
        video_id: 'video2',
        title: 'My Morning Routine for Success',
        views: 89000 + Math.floor(Math.random() * 5000),
        likes: 7300 + Math.floor(Math.random() * 500),
        comments: 840 + Math.floor(Math.random() * 100),
        watch_time: 267800 + Math.floor(Math.random() * 8000),
      },
      {
        video_id: 'video3',
        title: 'Top 10 Investment Tips for 2023',
        views: 210000 + Math.floor(Math.random() * 15000),
        likes: 18700 + Math.floor(Math.random() * 1200),
        comments: 2200 + Math.floor(Math.random() * 150),
        watch_time: 423000 + Math.floor(Math.random() * 12000),
      }
    ];
    
    return mockVideos;
  };

  // Sync YouTube analytics with our database
  const syncYouTubeAnalytics = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not found');
      
      // Fetch latest stats from YouTube API (mocked)
      const youtubeVideos = await fetchYouTubeStats();
      
      // Update each video in our database
      const updatePromises = youtubeVideos.map(async (video) => {
        const { data, error } = await supabase
          .from('video_analytics')
          .upsert({
            user_id: user.id,
            video_id: video.video_id,
            title: video.title,
            views: video.views,
            likes: video.likes,
            comments: video.comments,
            watch_time: video.watch_time,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,video_id'
          })
          .select();
        
        if (error) {
          console.error('Error syncing video analytics:', error);
          throw error;
        }
        
        return data;
      });
      
      await Promise.all(updatePromises);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-analytics', user?.id] });
      toast.success('YouTube analytics synchronized successfully');
    },
    onError: (error) => {
      toast.error('Failed to sync YouTube analytics');
      console.error(error);
    }
  });

  // Calculate total stats
  const totalStats = videos ? {
    videos: videos.length,
    views: videos.reduce((sum, video) => sum + video.views, 0),
    likes: videos.reduce((sum, video) => sum + video.likes, 0),
    comments: videos.reduce((sum, video) => sum + video.comments, 0),
    watchTimeHours: Math.round(videos.reduce((sum, video) => sum + video.watch_time, 0) / 3600)
  } : null;

  return {
    videos,
    isLoading,
    error,
    syncYouTubeAnalytics,
    totalStats
  };
};
