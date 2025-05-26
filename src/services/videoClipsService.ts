
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

export const getUserVideoClips = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
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
  const { error } = await supabase
    .from('video_clips')
    .delete()
    .eq('id', clipId);

  if (error) {
    console.error('Error deleting video clip:', error);
    throw error;
  }
};
