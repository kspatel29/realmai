
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

export interface YouTubeChannel {
  id: string;
  channel_name: string;
  channel_id: string;
  subscriber_count?: number;
  thumbnail?: string;
  description?: string;
  view_count?: number;
  video_count?: number;
  created_at?: string;
}

export interface ChannelAnalytics {
  revenue: number;
  engagement: number;
  growth: number;
  cpm: number;
  ctr: number;
  avgViewDuration: number;
}

export const useYouTubeAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch user's video analytics
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['video-analytics', user?.id],
    queryFn: async (): Promise<VideoAnalytics[]> => {
      if (!user) return [];
      
      console.log('Fetching video analytics for user:', user.id);
      
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
      
      console.log('Fetched video analytics:', data?.length || 0, 'videos');
      return data || [];
    },
    enabled: !!user,
  });

  // Mock data for additional features
  const channels: YouTubeChannel[] = [
    {
      id: '1',
      channel_name: 'TechReview Pro',
      channel_id: 'UC123456789',
      subscriber_count: 125000,
      thumbnail: '/placeholder.svg',
      view_count: 5000000,
      video_count: 250
    },
    {
      id: '2',
      channel_name: 'CreativeStudio',
      channel_id: 'UC987654321',
      subscriber_count: 89000,
      thumbnail: '/placeholder.svg',
      view_count: 3200000,
      video_count: 180
    }
  ];

  const channelDetails: YouTubeChannel | null = channels[0] || null;

  const analytics: ChannelAnalytics = {
    revenue: 5420.50,
    engagement: 8.5,
    growth: 12.3,
    cpm: 2.85,
    ctr: 4.2,
    avgViewDuration: 3.45
  };

  // Enhanced mock function with more realistic data
  const fetchYouTubeStats = async () => {
    const mockVideos = [
      {
        video_id: 'dQw4w9WgXcQ',
        title: 'How I Built a Successful YouTube Channel',
        views: 1250000 + Math.floor(Math.random() * 50000),
        likes: 89400 + Math.floor(Math.random() * 2000),
        comments: 12800 + Math.floor(Math.random() * 500),
        watch_time: 5456000 + Math.floor(Math.random() * 100000),
      },
      {
        video_id: 'oHg5SJYRHA0',
        title: 'The Secret to Viral Content Creation',
        views: 890000 + Math.floor(Math.random() * 30000),
        likes: 67300 + Math.floor(Math.random() * 1500),
        comments: 8940 + Math.floor(Math.random() * 400),
        watch_time: 3267800 + Math.floor(Math.random() * 80000),
      },
      {
        video_id: 'kJQP7kiw5Fk',
        title: 'YouTube Analytics Masterclass 2024',
        views: 2100000 + Math.floor(Math.random() * 75000),
        likes: 156700 + Math.floor(Math.random() * 2500),
        comments: 18200 + Math.floor(Math.random() * 600),
        watch_time: 7423000 + Math.floor(Math.random() * 150000),
      },
      {
        video_id: 'L_jWHffIx5E',
        title: 'Content Creator Business Tips',
        views: 645000 + Math.floor(Math.random() * 25000),
        likes: 42300 + Math.floor(Math.random() * 1000),
        comments: 5840 + Math.floor(Math.random() * 200),
        watch_time: 2967800 + Math.floor(Math.random() * 60000),
      }
    ];
    
    return mockVideos;
  };

  // Mock functions for additional features
  const searchChannels = async (query: string): Promise<YouTubeChannel[]> => {
    return channels.filter(channel => 
      channel.channel_name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getChannelDetails = async (channelId: string): Promise<YouTubeChannel | null> => {
    return channels.find(channel => channel.channel_id === channelId) || null;
  };

  const getChannelAnalytics = async (channelId: string): Promise<ChannelAnalytics> => {
    // Mock analytics data
    return {
      revenue: Math.random() * 10000,
      engagement: Math.random() * 15,
      growth: Math.random() * 20,
      cpm: Math.random() * 5,
      ctr: Math.random() * 8,
      avgViewDuration: Math.random() * 5
    };
  };

  // Sync YouTube analytics with enhanced error handling
  const syncYouTubeAnalytics = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Starting YouTube analytics sync for user:', user.id);
      toast.info('Syncing YouTube analytics...');
      
      try {
        // Fetch latest stats from YouTube API (mocked)
        const youtubeVideos = await fetchYouTubeStats();
        console.log('Fetched YouTube videos:', youtubeVideos.length);
        
        // Update each video in our database
        const updatePromises = youtubeVideos.map(async (video, index) => {
          console.log(`Syncing video ${index + 1}/${youtubeVideos.length}: ${video.title}`);
          
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
            console.error(`Error syncing video ${video.video_id}:`, error);
            throw error;
          }
          
          return data;
        });
        
        await Promise.all(updatePromises);
        console.log('Successfully synced all videos');
        return true;
      } catch (error) {
        console.error('YouTube sync error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-analytics', user?.id] });
      toast.success('YouTube analytics synchronized successfully! 🎉');
    },
    onError: (error) => {
      console.error('YouTube sync failed:', error);
      toast.error(`Failed to sync YouTube analytics: ${error.message}`);
    }
  });

  // Calculate comprehensive stats
  const totalStats = videos ? {
    videos: videos.length,
    views: videos.reduce((sum, video) => sum + video.views, 0),
    likes: videos.reduce((sum, video) => sum + video.likes, 0),
    comments: videos.reduce((sum, video) => sum + video.comments, 0),
    watchTimeHours: Math.round(videos.reduce((sum, video) => sum + video.watch_time, 0) / 3600),
    averageViews: videos.length > 0 ? Math.round(videos.reduce((sum, video) => sum + video.views, 0) / videos.length) : 0,
    engagementRate: videos.length > 0 ? 
      ((videos.reduce((sum, video) => sum + video.likes + video.comments, 0) / 
        videos.reduce((sum, video) => sum + video.views, 0)) * 100).toFixed(2) : '0.00'
  } : null;

  // Get trending videos (top performing)
  const trendingVideos = videos ? 
    [...videos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(video => ({
        ...video,
        growthRate: Math.random() * 10 + 2 // Mock growth rate
      }))
    : [];

  return {
    videos,
    isLoading,
    error,
    syncYouTubeAnalytics,
    totalStats,
    trendingVideos,
    isSyncing: syncYouTubeAnalytics.isPending,
    // Additional properties for enhanced analytics
    searchChannels,
    getChannelDetails,
    getChannelAnalytics,
    channels,
    channelDetails,
    analytics
  };
};
