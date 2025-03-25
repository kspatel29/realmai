
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MediaSelector, { MediaFile } from "@/components/MediaSelector";
import { useToast } from "@/hooks/use-toast";
import { useAudioFiles } from "@/hooks/useAudioFiles";
import { Card } from "@/components/ui/card";

interface UploadTabProps {
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  onFileUploaded: (file: File) => Promise<void>;
  onAudioUrlUploaded?: (url: string, originalFilename: string, duration?: number) => Promise<void>;
}

const UploadTab = ({ 
  isUploading, 
  setIsUploading, 
  onFileUploaded,
  onAudioUrlUploaded 
}: UploadTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAudio, setSelectedAudio] = useState<MediaFile | null>(null);
  
  const {
    audioFiles,
    isLoading: isLoadingAudio,
    uploadAudioFile,
    deleteAudioFile
  } = useAudioFiles();

  const handleFileSelected = (file: File) => {
    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
    
    uploadAudioFile.mutate({
      file,
      title: fileNameWithoutExt
    }, {
      onSuccess: async (newAudio) => {
        await onFileUploaded(file);
      },
      onError: (error) => {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
      }
    });
  };

  const handleLibraryAudioSelected = async (media: MediaFile) => {
    if (!user || !media.filename || !onAudioUrlUploaded) return;
    
    try {
      const filePath = `${user.id}/${media.id}/${media.filename}`;
      const { data, error } = await supabase.storage
        .from('audio')
        .createSignedUrl(filePath, 3600);
      
      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Error loading audio",
          description: "Could not load the selected audio file",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedAudio(media);
      await onAudioUrlUploaded(data.signedUrl, media.filename, media.duration || undefined);
    } catch (error) {
      console.error('Error in handleLibraryAudioSelected:', error);
      toast({
        title: "Error selecting audio",
        description: "Could not select the audio from library",
        variant: "destructive"
      });
    }
  };

  const mediaFiles = audioFiles?.map(audio => ({
    id: audio.id,
    title: audio.title,
    description: audio.description,
    filename: audio.filename,
    created_at: audio.created_at,
    file_size: audio.file_size,
    duration: audio.duration,
    type: 'audio' as const
  })) || [];

  return (
    <Card>
      <MediaSelector
        title="Upload Audio"
        description="Upload an audio file to generate subtitles from, or select from your library."
        mediaType="audio"
        onFileSelected={handleFileSelected}
        onFileFromLibrarySelected={handleLibraryAudioSelected}
        mediaFiles={mediaFiles}
        selectedMedia={selectedAudio}
        isLoading={isLoadingAudio}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        onUploadComplete={() => {}}
        onCancel={() => setSelectedAudio(null)}
        acceptTypes="audio/*"
      />
    </Card>
  );
};

export default UploadTab;
