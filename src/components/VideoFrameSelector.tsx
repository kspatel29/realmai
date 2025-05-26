
import { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Camera, SkipForward, SkipBack } from 'lucide-react';
import { toast } from "sonner";

interface VideoFrameSelectorProps {
  videoUrl: string;
  onStartFrameSelected: (dataUrl: string) => void;
  onEndFrameSelected: (dataUrl: string) => void;
}

const VideoFrameSelector = ({ 
  videoUrl, 
  onStartFrameSelected, 
  onEndFrameSelected 
}: VideoFrameSelectorProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    videoElement.addEventListener('loadedmetadata', handleMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', () => setIsPlaying(true));
    videoElement.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', () => setIsPlaying(true));
      videoElement.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, []);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleSliderChange = (values: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = values[0];
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, duration);
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Try to export the canvas data
      return canvas.toDataURL('image/jpeg');
    } catch (error) {
      console.error('Canvas taint error:', error);
      toast.error('Cannot capture frame due to CORS restrictions. Please upload your own image instead.');
      return null;
    }
  };

  const captureStartFrame = () => {
    const dataUrl = captureFrame();
    if (dataUrl) {
      onStartFrameSelected(dataUrl);
      toast.success('Start frame captured!');
    }
  };

  const captureEndFrame = () => {
    const dataUrl = captureFrame();
    if (dataUrl) {
      onEndFrameSelected(dataUrl);
      toast.success('End frame captured!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg aspect-video bg-black">
        <video 
          ref={videoRef} 
          src={videoUrl} 
          className="w-full h-full object-contain" 
          playsInline
          crossOrigin="anonymous"
        />
        
        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <Slider 
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.01}
          onValueChange={handleSliderChange}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={skipBackward}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={skipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={captureStartFrame}>
              <Camera className="h-4 w-4 mr-1" /> Start Frame
            </Button>
            <Button variant="outline" size="sm" onClick={captureEndFrame}>
              <Camera className="h-4 w-4 mr-1" /> End Frame
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoFrameSelector;
