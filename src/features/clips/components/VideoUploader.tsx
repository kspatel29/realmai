
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoUploaderProps {
  onVideoSelected: (file: File, videoUrl: string) => void;
  onUploadComplete: () => void;
  setCurrentTab: (tab: string) => void;
}

const VideoUploader = ({ onVideoSelected, onUploadComplete, setCurrentTab }: VideoUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);
      onVideoSelected(selectedFile, url);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Upload complete",
            description: "Your video has been uploaded successfully."
          });
          onUploadComplete();
        }
      }, 300);
      
      // Actual upload to storage could be done here
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video.",
        variant: "destructive"
      });
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Video (Optional)</CardTitle>
        <CardDescription>
          Upload a video to extract frames for the start and end of your generated clip, or generate directly from text.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
          {file ? (
            <div className="space-y-4">
              <div className="bg-muted rounded overflow-hidden relative aspect-video">
                <video 
                  ref={videoRef}
                  src={videoUrl!} 
                  className="w-full h-full object-contain" 
                  controls={false}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-background/800 backdrop-blur-sm p-2 flex items-center justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <Slider disabled />
                  </div>
                </div>
              </div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Drag and drop or click to upload</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports MP4, MOV, AVI up to 500MB
                </p>
              </div>
              <Input 
                id="video-upload" 
                type="file" 
                accept="video/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('video-upload')?.click()}
              >
                Select Video
              </Button>
            </div>
          )}
        </div>

        {file && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Video Title</Label>
              <Input id="title" className="mt-1" defaultValue={file.name.split('.')[0]} />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" className="mt-1" placeholder="Enter video description" />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setFile(null)} disabled={!file || isUploading}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentTab("generate")}
          >
            Skip to Generate
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className={isUploading ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
          >
            {isUploading ? `Uploading ${progress}%` : "Upload Video"}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VideoUploader;
