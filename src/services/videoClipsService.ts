
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
  const { data, error } = await supabase
    .from('video_clips')
    .insert([clipData])
    .select()
    .single();

  if (error) {
    console.error('Error saving video clip:', error);
    throw error;
  }

  return data;
};

export const getUserVideoClips = async () => {
  const { data, error } = await supabase
    .from('video_clips')
    .select('*')
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
