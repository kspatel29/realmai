
import { supabase } from "@/integrations/supabase/client";
import { fileManager } from "./fileManagementService";

export interface DubbingVideo {
  id: string;
  user_id: string;
  title: string;
  filename: string;
  file_size: number;
  duration?: number;
  video_url: string;
  created_at: string;
  used_in_dubbing_job?: string;
}

export const uploadDubbingVideo = async (file: File, title: string): Promise<DubbingVideo> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  console.log('Uploading dubbing video:', { filename: file.name, size: file.size });

  // Create a database entry for the dubbing video
  const { data: videoRecord, error: videoError } = await supabase
    .from('videos' as any)
    .insert({
      user_id: user.id,
      title,
      description: 'Video for dubbing',
      filename: file.name,
      file_size: file.size,
      status: 'uploading'
    })
    .select()
    .single();
  
  if (videoError) {
    console.error('Error creating dubbing video record:', videoError);
    throw videoError;
  }

  try {
    // Upload file to the videos bucket (for dubbing)
    const uploadResult = await fileManager.uploadFile(file, 'videos', user.id, videoRecord.id);
    
    // Update the video record with the completed status
    const { error: updateError } = await supabase
      .from('videos' as any)
      .update({ 
        status: 'ready',
        updated_at: new Date().toISOString()
      })
      .eq('id', videoRecord.id);
    
    if (updateError) {
      console.error('Error updating dubbing video status:', updateError);
      throw updateError;
    }

    return {
      id: videoRecord.id,
      user_id: videoRecord.user_id,
      title: videoRecord.title,
      filename: videoRecord.filename || file.name,
      file_size: videoRecord.file_size || file.size,
      duration: videoRecord.duration || undefined,
      video_url: uploadResult.publicUrl,
      created_at: videoRecord.created_at,
      used_in_dubbing_job: videoRecord.used_in_job
    };
  } catch (uploadError) {
    // Update status to failed if upload failed
    await supabase
      .from('videos' as any)
      .update({ status: 'failed' })
      .eq('id', videoRecord.id);
    
    throw uploadError;
  }
};

export const getDubbingVideos = async (): Promise<DubbingVideo[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('videos' as any)
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'ready')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching dubbing videos:', error);
    throw error;
  }

  return (data || []).map(video => ({
    id: video.id,
    user_id: video.user_id,
    title: video.title,
    filename: video.filename || '',
    file_size: video.file_size || 0,
    duration: video.duration || undefined,
    video_url: `https://ptihuoxqjymxvvaotzaw.supabase.co/storage/v1/object/public/videos/${user.id}/${video.id}/${video.filename}`,
    created_at: video.created_at,
    used_in_dubbing_job: video.used_in_job
  }));
};

export const getVideoUrl = async (videoId: string): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const { data, error } = await supabase
      .from('videos' as any)
      .select('filename')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return `https://ptihuoxqjymxvvaotzaw.supabase.co/storage/v1/object/public/videos/${user.id}/${videoId}/${data.filename}`;
  } catch (error) {
    console.error('Error getting video URL:', error);
    throw error;
  }
};

export const markVideoAsUsedInDubbing = async (videoId: string, dubbingJobId: string) => {
  const { error } = await supabase
    .from('videos' as any)
    .update({ 
      used_in_job: dubbingJobId,
      updated_at: new Date().toISOString()
    })
    .eq('id', videoId);
  
  if (error) {
    console.error('Error marking video as used in dubbing:', error);
    throw error;
  }
};
