
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FileUploadResult {
  id: string;
  url: string;
  publicUrl: string;
  path: string;
}

export interface MediaFile {
  id: string;
  title: string;
  description?: string;
  filename: string;
  file_size: number;
  duration?: number;
  created_at: string;
  type: 'video' | 'audio';
}

export class FileManagementService {
  private static instance: FileManagementService;
  
  public static getInstance(): FileManagementService {
    if (!FileManagementService.instance) {
      FileManagementService.instance = new FileManagementService();
    }
    return FileManagementService.instance;
  }

  async uploadFile(
    file: File, 
    bucket: 'videos' | 'audio' | 'uploads' | 'video-clips',
    userId: string,
    recordId?: string
  ): Promise<FileUploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = recordId 
        ? `${userId}/${recordId}/${fileName}`
        : `${userId}/${fileName}`;

      console.log(`Uploading file to ${bucket}/${filePath}`);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        id: recordId || crypto.randomUUID(),
        url: urlData.publicUrl,
        publicUrl: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  async deleteFile(bucket: 'videos' | 'audio' | 'uploads' | 'video-clips', filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  }

  async getSignedUrl(bucket: 'videos' | 'audio' | 'uploads' | 'video-clips', filePath: string, expiresIn = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Signed URL error:', error);
        throw new Error(`Signed URL failed: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Get signed URL error:', error);
      throw error;
    }
  }

  async getFileDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const media = file.type.startsWith('video/') 
        ? document.createElement('video')
        : document.createElement('audio');
      
      media.preload = 'metadata';
      media.onloadedmetadata = () => {
        resolve(media.duration);
        URL.revokeObjectURL(media.src);
      };
      media.onerror = () => {
        reject(new Error('Failed to load media metadata'));
        URL.revokeObjectURL(media.src);
      };
      
      media.src = URL.createObjectURL(file);
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

export const fileManager = FileManagementService.getInstance();
