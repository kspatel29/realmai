
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, Download, Share2, Trash2, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useVideoClips } from "@/hooks/useVideoClips";

export interface ClipData {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  url: string;
}

interface ClipPreviewProps {
  clips: ClipData[];
  onBackToGeneration: () => void;
}

const ClipPreview = ({ clips, onBackToGeneration }: ClipPreviewProps) => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<ClipData | null>(null);
  const { deleteClip } = useVideoClips();

  const handleVideoError = (clip: ClipData, error: any) => {
    console.error('Video playback error for clip:', clip.id, error);
    console.log('Video URL:', clip.url);
    toast.error(`Failed to load video: ${clip.title}`);
  };

  const handleVideoLoadStart = (clip: ClipData) => {
    console.log('Video load started for clip:', clip.id, 'URL:', clip.url);
  };

  const handleVideoCanPlay = (clip: ClipData) => {
    console.log('Video can play for clip:', clip.id);
  };

  const handleDownload = async (clip: ClipData) => {
    try {
      console.log('Attempting to download:', clip.url);
      const response = await fetch(clip.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${clip.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download video');
    }
  };

  const handleShare = async (clip: ClipData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: clip.title,
          text: `Check out this generated video: ${clip.title}`,
          url: clip.url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(clip.url);
        toast.success('Video URL copied to clipboard!');
      } catch (error) {
        console.error('Copy failed:', error);
        toast.error('Failed to copy URL');
      }
    }
  };

  const handleDelete = (clipId: string) => {
    deleteClip(clipId);
  };

  const toggleVideoPlay = (videoId: string) => {
    console.log('Toggling video play for:', videoId);
    if (playingVideo === videoId) {
      setPlayingVideo(null);
    } else {
      setPlayingVideo(videoId);
    }
  };

  const openFullscreen = (clip: ClipData) => {
    console.log('Opening fullscreen for clip:', clip.id);
    setFullscreenVideo(clip);
  };

  if (clips.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">No videos generated yet</h3>
            <p className="text-muted-foreground">
              Generate your first video clip to see it here
            </p>
            <Button onClick={onBackToGeneration} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Generation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generated Video Clips</h2>
          <p className="text-muted-foreground">
            {clips.length} video{clips.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <Button variant="outline" onClick={onBackToGeneration}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Generation
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clips.map((clip) => (
          <Card key={clip.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base line-clamp-2">{clip.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                      {clip.duration}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(clip.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative group">
                <video
                  key={clip.id}
                  src={clip.url}
                  poster={clip.thumbnail}
                  className="w-full aspect-video object-cover rounded-md"
                  controls={playingVideo === clip.id}
                  onPlay={() => setPlayingVideo(clip.id)}
                  onPause={() => setPlayingVideo(null)}
                  onError={(e) => handleVideoError(clip, e)}
                  onLoadStart={() => handleVideoLoadStart(clip)}
                  onCanPlay={() => handleVideoCanPlay(clip)}
                  preload="metadata"
                  crossOrigin="anonymous"
                >
                  Your browser does not support the video tag.
                </video>
                
                {playingVideo !== clip.id && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-12 h-12 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                      onClick={() => toggleVideoPlay(clip.id)}
                    >
                      <Play className="h-5 w-5 ml-0.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-12 h-12 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                      onClick={() => openFullscreen(clip)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(clip)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(clip)}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fullscreen Video Dialog */}
      <Dialog open={!!fullscreenVideo} onOpenChange={() => setFullscreenVideo(null)}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{fullscreenVideo?.title}</DialogTitle>
          </DialogHeader>
          {fullscreenVideo && (
            <div className="w-full">
              <video
                key={`fullscreen-${fullscreenVideo.id}`}
                src={fullscreenVideo.url}
                className="w-full h-auto max-h-[70vh] object-contain"
                controls
                autoPlay
                onError={(e) => handleVideoError(fullscreenVideo, e)}
                crossOrigin="anonymous"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClipPreview;
