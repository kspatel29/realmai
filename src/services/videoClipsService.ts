
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

  // Download and store the video if it's an external URL
  let finalVideoUrl = clipData.video_url;
  if (clipData.video_url && (clipData.video_url.includes('replicate.delivery') || clipData.video_url.includes('sieve-prod'))) {
    try {
      finalVideoUrl = await downloadAndStoreVideo(clipData.video_url, `${clipData.title.replace(/[^a-z0-9]/gi, '_')}.mp4`);
      console.log('Video stored in Supabase:', finalVideoUrl);
    } catch (error) {
      console.error('Failed to store video in Supabase, using original URL:', error);
    }
  }

  const clipWithUserId = {
    ...clipData,
    video_url: finalVideoUrl,
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
    console.log('Downloading video from:', videoUrl);
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
    
    console.log('Uploading video to Supabase storage:', filePath);
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

    console.log('Video successfully stored at:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in downloadAndStoreVideo:', error);
    throw error;
  }
};

export const downloadAndStoreDubbedVideo = async (videoUrl: string, fileName: string): Promise<string> => {
  try {
    console.log('Downloading dubbed video from:', videoUrl);
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
    
    console.log('Uploading dubbed video to Supabase storage:', filePath);
    const { data, error } = await supabase.storage
      .from('dubbed-videos')
      .upload(filePath, videoBlob, {
        contentType: 'video/mp4',
        cacheControl: '3600'
      });

    if (error) {
      console.error('Error uploading dubbed video to storage:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('dubbed-videos')
      .getPublicUrl(data.path);

    console.log('Dubbed video successfully stored at:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in downloadAndStoreDubbedVideo:', error);
    throw error;
  }
};

export const downloadAndStoreSubtitleFiles = async (srtUrl?: string, vttUrl?: string, jobId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const results: { srtUrl?: string; vttUrl?: string } = {};

  try {
    if (srtUrl) {
      console.log('Downloading SRT file from:', srtUrl);
      const response = await fetch(srtUrl);
      if (response.ok) {
        const srtBlob = await response.blob();
        const filePath = `${user.id}/${Date.now()}-${jobId || 'subtitle'}.srt`;
        
        const { data, error } = await supabase.storage
          .from('subtitle-files')
          .upload(filePath, srtBlob, {
            contentType: 'text/plain',
            cacheControl: '3600'
          });

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('subtitle-files')
            .getPublicUrl(data.path);
          results.srtUrl = publicUrl;
          console.log('SRT file stored at:', publicUrl);
        }
      }
    }

    if (vttUrl) {
      console.log('Downloading VTT file from:', vttUrl);
      const response = await fetch(vttUrl);
      if (response.ok) {
        const vttBlob = await response.blob();
        const filePath = `${user.id}/${Date.now()}-${jobId || 'subtitle'}.vtt`;
        
        const { data, error } = await supabase.storage
          .from('subtitle-files')
          .upload(filePath, vttBlob, {
            contentType: 'text/vtt',
            cacheControl: '3600'
          });

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('subtitle-files')
            .getPublicUrl(data.path);
          results.vttUrl = publicUrl;
          console.log('VTT file stored at:', publicUrl);
        }
      }
    }
  } catch (error) {
    console.error('Error downloading and storing subtitle files:', error);
  }

  return results;
};
