
import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { fileManager } from "@/services/fileManagementService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UploadedVideo {
  id: string;
  title: string;
  duration?: number;
  url: string;
  created_at: string;
}

export const useVideoUploadManager = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadVideo = async (file: File, title: string): Promise<UploadedVideo> => {
    if (!user) {
      throw new Error('User must be authenticated to upload videos');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('Starting video upload:', { filename: file.name, size: file.size });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload file using file manager
      const uploadResult = await fileManager.uploadFile(file, 'video-clips', user.id);
      
      clearInterval(progressInterval);
      setUploadProgress(95);

      // Get video duration
      let duration: number | undefined;
      try {
        duration = await fileManager.getFileDuration(file);
      } catch (error) {
        console.warn('Could not get video duration:', error);
      }

      // Create video clip record in database
      const { data, error } = await supabase
        .from('video_clips')
        .insert({
          user_id: user.id,
          title,
          prompt: title, // Use title as prompt for uploaded videos
          duration: duration ? Math.floor(duration) : 5,
          aspect_ratio: '16:9', // Default aspect ratio
          video_url: uploadResult.publicUrl,
          cost_credits: 0, // No credits for uploaded videos
          status: 'completed'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      setUploadProgress(100);

      const result: UploadedVideo = {
        id: data.id,
        title: data.title,
        duration: data.duration || undefined,
        url: data.video_url,
        created_at: data.created_at
      };

      console.log('Video upload completed:', result);
      return result;

    } catch (error) {
      console.error('Video upload failed:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getVideoUrl = async (videoId: string): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('video_clips')
        .select('video_url')
        .eq('id', videoId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return data.video_url;
    } catch (error) {
      console.error('Error getting video URL:', error);
      throw error;
    }
  };

  return {
    uploadVideo,
    getVideoUrl,
    isUploading,
    uploadProgress: isUploading ? uploadProgress : 0
  };
};
