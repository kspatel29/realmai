
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, Download, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

  const handleDownload = async (clip: ClipData) => {
    try {
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
    // Remove from localStorage
    const savedClips = localStorage.getItem('generatedVideoClips');
    if (savedClips) {
      const clips = JSON.parse(savedClips);
      const updatedClips = clips.filter((clip: ClipData) => clip.id !== clipId);
      localStorage.setItem('generatedVideoClips', JSON.stringify(updatedClips));
      toast.success('Video removed from history');
      // Force a reload of the page to reflect changes
      window.location.reload();
    }
  };

  const toggleVideoPlay = (videoId: string) => {
    if (playingVideo === videoId) {
      setPlayingVideo(null);
    } else {
      setPlayingVideo(videoId);
    }
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
                  <CardDescription>
                    <Badge variant="secondary">{clip.duration}</Badge>
                  </CardDescription>
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
                  src={clip.url}
                  poster={clip.thumbnail}
                  className="w-full aspect-video object-cover rounded-md"
                  controls={playingVideo === clip.id}
                  onPlay={() => setPlayingVideo(clip.id)}
                  onPause={() => setPlayingVideo(null)}
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
                
                {playingVideo !== clip.id && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                    onClick={() => toggleVideoPlay(clip.id)}
                  >
                    <Play className="h-5 w-5 ml-0.5" />
                  </Button>
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
    </div>
  );
};

export default ClipPreview;
