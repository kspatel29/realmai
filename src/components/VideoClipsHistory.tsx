
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Download, 
  RefreshCw, 
  Loader2, 
  Video,
  Calendar,
  Clock,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { VideoClip } from "@/services/videoClipsService";
import { useVideoClips } from "@/hooks/useVideoClips";

interface VideoClipsHistoryProps {
  clips: VideoClip[];
  isLoading: boolean;
  onRefresh: () => void;
}

const VideoClipsHistory = ({ clips, isLoading, onRefresh }: VideoClipsHistoryProps) => {
  const { deleteClip, isDeleting } = useVideoClips();
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});

  const handleRefresh = () => {
    onRefresh();
    toast.success("Video clips refreshed");
  };

  const handleDownload = async (clip: VideoClip) => {
    if (!clip.video_url) return;

    try {
      setDownloadProgress(prev => ({ ...prev, [clip.id]: 0 }));

      const response = await fetch(clip.video_url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength ?? '0', 10);
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to initialize download');

      const chunks = [];
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        const progress = total > 0 ? (loaded / total) * 100 : 50;
        setDownloadProgress(prev => ({ ...prev, [clip.id]: progress }));
      }

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const filename = `${clip.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Downloaded ${filename}`);

    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download video");
    } finally {
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[clip.id];
        return newProgress;
      });
    }
  };

  const handleDelete = async (clipId: string) => {
    if (window.confirm("Are you sure you want to delete this video clip?")) {
      deleteClip(clipId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Video className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium">No video clips yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Generate your first video clip to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {clips.length} video clips total
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clips.map(clip => (
          <Card key={clip.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base truncate">{clip.title}</CardTitle>
                <Badge variant={clip.status === 'completed' ? 'default' : 'secondary'}>
                  {clip.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {clip.prompt && clip.prompt.substring(0, 60)}
                {clip.prompt && clip.prompt.length > 60 && "..."}
              </div>
            </CardHeader>
            
            {clip.thumbnail_url && (
              <div className="px-4">
                <img 
                  src={clip.thumbnail_url} 
                  alt={clip.title}
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
            
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {clip.duration}s
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(clip.created_at), "MMM d")}
                </div>
              </div>
              
              <div className="text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aspect ratio:</span>
                  <span>{clip.aspect_ratio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits used:</span>
                  <span>{clip.cost_credits}</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex justify-between gap-2">
              <div className="flex gap-2">
                {clip.video_url && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(clip.video_url, '_blank')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(clip)}
                      disabled={clip.id in downloadProgress}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {clip.id in downloadProgress ? 'Downloading...' : 'Download'}
                    </Button>
                  </>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDelete(clip.id)}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </CardFooter>
            
            {clip.id in downloadProgress && (
              <div className="px-4 pb-4">
                <Progress value={downloadProgress[clip.id]} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {Math.round(downloadProgress[clip.id])}%
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VideoClipsHistory;
