
import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { uploadAudioFile, isAudioFile } from "@/services/api/subtitlesService";

interface AudioFileUploaderProps {
  onFileUploaded: (url: string, fromVideo: boolean, fileName?: string) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

const AudioFileUploader = ({ 
  onFileUploaded, 
  isUploading, 
  setIsUploading 
}: AudioFileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!isAudioFile(selectedFile)) {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file (MP3, WAV, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 300);
    
    return () => clearInterval(interval);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an audio file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    const stopProgress = simulateProgress();
    
    try {
      // Upload the file to get a URL
      const fileUrl = await uploadAudioFile(file);
      
      setProgress(100);
      setIsUploading(false);
      onFileUploaded(fileUrl, false, file.name);
      toast({
        title: "Upload complete",
        description: "Your audio file has been uploaded successfully."
      });
    } catch (error) {
      stopProgress();
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
        {file ? (
          <div className="space-y-2">
            <div className="bg-muted rounded h-48 flex items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
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
                Supports audio files (MP3, WAV, etc.)
              </p>
            </div>
            <Input 
              id="subtitle-upload" 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('subtitle-upload')?.click()}
              disabled={isUploading}
            >
              Select File
            </Button>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="auto-transcribe" defaultChecked />
          <label htmlFor="auto-transcribe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Auto-detect language (if not selected below)
          </label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setFile(null)} disabled={!file || isUploading}>
          Cancel
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          className={isUploading ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
        >
          {isUploading ? `Uploading ${progress}%` : "Upload File"}
          <Upload className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AudioFileUploader;
