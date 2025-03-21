import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  filename: string | null;
  file_size: number | null;
  duration: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useVideos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos', user?.id],
    queryFn: async (): Promise<Video[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  const uploadVideo = useMutation({
    mutationFn: async ({ 
      file, 
      title, 
      description = '' 
    }: { 
      file: File; 
      title: string; 
      description?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // First create a database entry for the video
      const { data: videoRecord, error: videoError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title,
          description,
          filename: file.name,
          file_size: file.size,
          status: 'uploading'
        })
        .select()
        .single();
      
      if (videoError) {
        console.error('Error creating video record:', videoError);
        throw videoError;
      }
      
      // Upload the file to storage
      const filePath = `${user.id}/${videoRecord.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading video file:', uploadError);
        
        // Update the status to 'failed' if upload failed
        await supabase
          .from('videos')
          .update({ status: 'failed' })
          .eq('id', videoRecord.id);
          
        throw uploadError;
      }
      
      // Update the video record with the completed status
      const { error: updateError } = await supabase
        .from('videos')
        .update({ 
          status: 'ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', videoRecord.id);
      
      if (updateError) {
        console.error('Error updating video status:', updateError);
        throw updateError;
      }
      
      return videoRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', user?.id] });
      toast.success('Video uploaded successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const deleteVideo = useMutation({
    mutationFn: async (videoId: string) => {
      if (!user) throw new Error('User not authenticated');

      // First get the video record to get the filename
      const { data: videoRecord, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching video to delete:', fetchError);
        throw fetchError;
      }
      
      // Delete the file from storage if it exists
      if (videoRecord.filename) {
        const filePath = `${user.id}/${videoId}/${videoRecord.filename}`;
        const { error: storageError } = await supabase.storage
          .from('videos')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Error deleting video file from storage:', storageError);
          // Continue with deletion of database record even if storage deletion fails
        }
      }
      
      // Delete the database record
      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);
      
      if (deleteError) {
        console.error('Error deleting video record:', deleteError);
        throw deleteError;
      }
      
      return videoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', user?.id] });
      toast.success('Video deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    videos,
    isLoading,
    error,
    uploadVideo,
    deleteVideo
  };
};
