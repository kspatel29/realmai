
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserVideoClips, saveVideoClip, deleteVideoClip, VideoClip } from '@/services/videoClipsService';
import { useToast } from '@/hooks/use-toast';

export const useVideoClips = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clips = [], isLoading, error, refetch } = useQuery({
    queryKey: ['video-clips'],
    queryFn: getUserVideoClips,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const saveClipMutation = useMutation({
    mutationFn: saveVideoClip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-clips'] });
      toast({
        title: "Clip saved",
        description: "Your video clip has been saved to history."
      });
    },
    onError: (error) => {
      console.error('Error saving clip:', error);
      toast({
        title: "Error saving clip",
        description: "There was an error saving your video clip.",
        variant: "destructive"
      });
    }
  });

  const deleteClipMutation = useMutation({
    mutationFn: deleteVideoClip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-clips'] });
      toast({
        title: "Clip deleted",
        description: "The video clip has been deleted."
      });
    },
    onError: (error) => {
      console.error('Error deleting clip:', error);
      toast({
        title: "Error deleting clip",
        description: "There was an error deleting the video clip.",
        variant: "destructive"
      });
    }
  });

  return {
    clips,
    isLoading,
    error,
    refetch,
    saveClip: saveClipMutation.mutate,
    deleteClip: deleteClipMutation.mutate,
    isSaving: saveClipMutation.isPending,
    isDeleting: deleteClipMutation.isPending
  };
};
