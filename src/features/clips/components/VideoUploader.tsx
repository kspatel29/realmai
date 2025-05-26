
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
      title: fileNameWithoutExt,
      prompt: fileNameWithoutExt,
      file: file  // Pass actual file instead of blob URL
    }, {
      onSuccess: (newVideo) => {
        // Use the stored video URL instead of creating a new blob URL
        onVideoSelected(file, newVideo.video_url);
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
    if (!user) return;
    
    try {
      // Find the video in our videos list
      const video = videos?.find(v => v.id === media.id);
      if (!video) {
        toast({
          title: "Error selecting video",
          description: "Could not find the selected video",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedVideo(media);
      
      // Create a File object from the video URL and pass to parent
      fetch(video.video_url)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], `${video.title}.mp4`, { type: blob.type });
          onVideoSelected(file, video.video_url);
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
    description: video.prompt,
    filename: `${video.title}.mp4`,
    created_at: video.created_at,
    file_size: 0, // We don't have file size in video_clips table
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
