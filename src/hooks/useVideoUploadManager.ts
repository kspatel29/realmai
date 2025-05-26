
import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { fileManager } from "@/services/fileManagementService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UploadedVideo {
  id: string;
  title: string;
  filename: string;
  file_size: number;
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
      const uploadResult = await fileManager.uploadFile(file, 'videos', user.id);
      
      clearInterval(progressInterval);
      setUploadProgress(95);

      // Get video duration
      let duration: number | undefined;
      try {
        duration = await fileManager.getFileDuration(file);
      } catch (error) {
        console.warn('Could not get video duration:', error);
      }

      // Create video record in database using raw query since types aren't updated yet
      const { data, error } = await supabase
        .from('videos' as any)
        .insert({
          user_id: user.id,
          title,
          filename: file.name,
          file_size: file.size,
          duration: duration ? Math.floor(duration) : null,
          status: 'uploaded'
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
        filename: data.filename,
        file_size: data.file_size,
        duration: data.duration || undefined,
        url: uploadResult.publicUrl,
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
        .from('videos' as any)
        .select('filename')
        .eq('id', videoId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const filePath = `${user.id}/${videoId}/${data.filename}`;
      return await fileManager.getSignedUrl('videos', filePath);
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
