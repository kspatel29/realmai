
import { supabase } from "@/integrations/supabase/client";

export interface VideoClip {
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

export const saveVideoClip = async (clipData: Omit<VideoClip, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const clipWithUserId = {
    ...clipData,
    user_id: user.id
  };

  const { data, error } = await supabase
    .from('video_clips')
    .insert(clipWithUserId)
    .select()
    .single();

  if (error) {
    console.error('Error saving video clip:', error);
    throw error;
  }

  return data;
};

export const getUserVideoClips = async (): Promise<VideoClip[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('video_clips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching video clips:', error);
    throw error;
  }

  return data || [];
};

export const deleteVideoClip = async (clipId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('video_clips')
    .delete()
    .eq('id', clipId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting video clip:', error);
    throw error;
  }
};

export const downloadAndStoreVideo = async (videoUrl: string, fileName: string): Promise<string> => {
  try {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const filePath = `${user.id}/${Date.now()}-${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('video-clips')
      .upload(filePath, videoBlob, {
        contentType: 'video/mp4',
        cacheControl: '3600'
      });

    if (error) {
      console.error('Error uploading video to storage:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('video-clips')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error in downloadAndStoreVideo:', error);
    return videoUrl;
  }
};
