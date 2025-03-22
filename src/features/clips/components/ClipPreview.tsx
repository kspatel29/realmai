
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Film, Clock, Check, Download, DownloadCloud, Video } from "lucide-react";
import { toast } from "sonner";

export interface ClipData {
  id: string;
  title: string;
  duration: string;
  thumbnail?: string;
  url: string | null;
}

interface ClipPreviewProps {
  clips: ClipData[];
  onBackToGeneration: () => void;
}

const ClipPreview = ({ clips, onBackToGeneration }: ClipPreviewProps) => {
  const handleDownload = async (url: string, title: string) => {
    try {
      // Fetch the video as a blob
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title || 'video'}.mp4`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success("Video downloaded successfully!");
    } catch (error) {
      console.error("Error downloading video:", error);
      toast.error("Failed to download video");
    }
  };
  
  const handleDownloadAll = async () => {
    if (clips.length === 0) return;
    
    // Download each clip with a slight delay to prevent browser issues
    let downloadedCount = 0;
    for (const clip of clips) {
      if (clip.url) {
        try {
          await handleDownload(clip.url, clip.title);
          downloadedCount++;
        } catch (error) {
          console.error(`Error downloading clip ${clip.id}:`, error);
        }
        // Short delay between downloads
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (downloadedCount > 0) {
      toast.success(`Downloaded ${downloadedCount} clips successfully!`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview & Download</CardTitle>
        <CardDescription>
          Preview and download your generated video clips.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {clips.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Film className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">No clips generated yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate clips to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {clips.map((clip) => (
                  <div key={clip.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-black flex items-center justify-center">
                      {clip.url ? (
                        <video 
                          src={clip.url} 
                          className="w-full h-full object-contain" 
                          controls 
                        />
                      ) : (
                        <Video className="h-12 w-12 text-white/30" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{clip.title}</h3>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> {clip.duration}
                        </span>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => toast.success("Clip saved to library")}
                        >
                          <Check className="h-4 w-4 mr-1" /> Save to Library
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1" 
                          disabled={!clip.url}
                          onClick={() => clip.url && handleDownload(clip.url, clip.title)}
                        >
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button 
          variant="outline"
          onClick={onBackToGeneration}
        >
          Back to Generation
        </Button>
        <Button 
          className="bg-youtube-red hover:bg-youtube-darkred" 
          disabled={clips.length === 0}
          onClick={handleDownloadAll}
        >
          <DownloadCloud className="mr-2 h-4 w-4" />
          Download All Clips
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClipPreview;
