
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useVideos } from "@/hooks/useVideos";
import { supabase } from "@/integrations/supabase/client";
import MediaSelector, { MediaFile } from "@/components/MediaSelector";
import { useToast } from "@/hooks/use-toast";

interface VideoUploaderProps {
  onVideoSelected: (file: File, videoUrl: string) => void;
  onUploadComplete: () => void;
  setCurrentTab: (tab: string) => void;
}

const VideoUploader = ({ onVideoSelected, onUploadComplete, setCurrentTab }: VideoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    videos, 
    isLoading: isLoadingVideos, 
    uploadVideo,
    deleteVideo
  } = useVideos();
  
  const [selectedVideo, setSelectedVideo] = useState<MediaFile | null>(null);

  const handleFileSelected = (file: File) => {
    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
    
    uploadVideo.mutate({
      file,
      title: fileNameWithoutExt
    }, {
      onSuccess: (newVideo) => {
        onVideoSelected(file, URL.createObjectURL(file));
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

  const handleLibraryVideoSelected = async (media: MediaFile) => {
    if (!user || !media.filename) return;
    
    try {
      const filePath = `${user.id}/${media.id}/${media.filename}`;
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 3600);
      
      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Error loading video",
          description: "Could not load the selected video",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedVideo(media);
      
      // Create a File object or get URL and pass to parent
      fetch(data.signedUrl)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], media.filename || "video.mp4", { type: blob.type });
          onVideoSelected(file, data.signedUrl);
        })
        .catch(error => {
          console.error("Error converting blob to file:", error);
          toast({
            title: "Error processing video",
            description: "Could not process the selected video",
            variant: "destructive"
          });
        });
    } catch (error) {
      console.error('Error in handleLibraryVideoSelected:', error);
      toast({
        title: "Error selecting video",
        description: "Could not select the video from library",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteVideo.mutateAsync(id);
      if (selectedVideo?.id === id) {
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the video",
        variant: "destructive"
      });
    }
  };

  const mediaFiles = videos?.map(video => ({
    id: video.id,
    title: video.title,
    description: video.description,
    filename: video.filename,
    created_at: video.created_at,
    file_size: video.file_size,
    type: 'video' as const
  })) || [];

  return (
    <MediaSelector
      title="Upload Video (Optional)"
      description="Upload a video to extract frames for the start and end of your generated clip, or generate directly from text."
      mediaType="video"
      onFileSelected={handleFileSelected}
      onFileFromLibrarySelected={handleLibraryVideoSelected}
      mediaFiles={mediaFiles}
      selectedMedia={selectedVideo}
      isLoading={isLoadingVideos}
      isUploading={isUploading}
      setIsUploading={setIsUploading}
      onUploadComplete={onUploadComplete}
      onCancel={() => setSelectedVideo(null)}
    />
  );
};

export default VideoUploader;
