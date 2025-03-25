
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface AudioFile {
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
  used_in_job: string | null;
}

export const useAudioFiles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: audioFiles, isLoading, error } = useQuery({
    queryKey: ['audioFiles', user?.id],
    queryFn: async (): Promise<AudioFile[]> => {
      if (!user) return [];
      
      // Use a type assertion to treat 'audio_files' as a valid table
      const { data, error } = await supabase
        .from('audio_files' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching audio files:', error);
        toast.error('Failed to load audio files');
        throw error;
      }
      
      // Properly cast the data to AudioFile[] type
      return (data || []) as AudioFile[];
    },
    enabled: !!user,
  });

  const uploadAudioFile = useMutation({
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
      
      // First create a database entry for the audio file
      const { data: audioRecord, error: audioError } = await supabase
        .from('audio_files' as any)
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
      
      if (audioError) {
        console.error('Error creating audio record:', audioError);
        throw audioError;
      }
      
      // Properly cast audioRecord to AudioFile
      const typedAudioRecord = audioRecord as AudioFile;
      
      // Upload the file to storage
      const filePath = `${user.id}/${typedAudioRecord.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading audio file:', uploadError);
        
        // Update the status to 'failed' if upload failed
        await supabase
          .from('audio_files' as any)
          .update({ status: 'failed' })
          .eq('id', typedAudioRecord.id);
          
        throw uploadError;
      }
      
      // Update the audio record with the completed status
      const { error: updateError } = await supabase
        .from('audio_files' as any)
        .update({ 
          status: 'ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', typedAudioRecord.id);
      
      if (updateError) {
        console.error('Error updating audio status:', updateError);
        throw updateError;
      }
      
      return typedAudioRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audioFiles', user?.id] });
      toast.success('Audio file uploaded successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to upload audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const deleteAudioFile = useMutation({
    mutationFn: async (audioId: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        // First get the audio record to get the filename
        const { data: audioRecord, error: fetchError } = await supabase
          .from('audio_files' as any)
          .select('*')
          .eq('id', audioId)
          .single();
        
        if (fetchError) {
          console.error('Error fetching audio to delete:', fetchError);
          throw fetchError;
        }
        
        // Properly cast audioRecord to AudioFile
        const typedAudioRecord = audioRecord as AudioFile;
        
        // Delete the file from storage if it exists
        if (typedAudioRecord.filename) {
          const filePath = `${user.id}/${audioId}/${typedAudioRecord.filename}`;
          const { error: storageError } = await supabase.storage
            .from('audio')
            .remove([filePath]);
          
          if (storageError) {
            console.error('Error deleting audio file from storage:', storageError);
            // Continue with deletion of database record even if storage deletion fails
          }
        }
        
        // Delete the database record
        const { error: deleteError } = await supabase
          .from('audio_files' as any)
          .delete()
          .eq('id', audioId);
        
        if (deleteError) {
          console.error('Error deleting audio record:', deleteError);
          throw deleteError;
        }
        
        return audioId;
      } catch (error) {
        console.error('Error in deleteAudioFile mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audioFiles', user?.id] });
      toast.success('Audio file deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const markAudioAsUsed = useMutation({
    mutationFn: async ({ audioId, jobId }: { audioId: string; jobId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('audio_files' as any)
        .update({ 
          used_in_job: jobId,
          updated_at: new Date().toISOString()
        })
        .eq('id', audioId);
      
      if (error) {
        console.error('Error marking audio as used:', error);
        throw error;
      }
      
      return { audioId, jobId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audioFiles', user?.id] });
    }
  });

  return {
    audioFiles,
    isLoading,
    error,
    uploadAudioFile,
    deleteAudioFile,
    markAudioAsUsed
  };
};
