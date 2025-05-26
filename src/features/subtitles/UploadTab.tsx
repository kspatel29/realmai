
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileAudio, FileVideo, X } from "lucide-react";
import { toast } from "sonner";
import { uploadAudioFile, isAudioFile } from "@/services/api/subtitlesService";

interface UploadTabProps {
  isUploading: boolean;
  setIsUploading: (loading: boolean) => void;
  onFileUploaded: (file: File) => Promise<void>;
}

const UploadTab = ({ isUploading, setIsUploading, onFileUploaded }: UploadTabProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideoFile = (file: File): boolean => {
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return videoExtensions.includes(extension);
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (!isAudioFile(file) && !isVideoFile(file)) {
      toast.error("Please upload an audio or video file");
      return;
    }

    setIsUploading(true);
    
    try {
      // Create preview URL for the file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadedFile(file);
      
      // Call the onFileUploaded callback
      await onFileUploaded(file);
      
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      setPreviewUrl(null);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Audio or Video File</CardTitle>
          <CardDescription>
            Upload your audio or video file to generate subtitles automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/10" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium">
                    Drag and drop your file here, or{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      browse
                    </Button>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports: MP3, WAV, OGG, AAC, M4A, FLAC, MP4, MOV, AVI, MKV, WEBM
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="audio/*,video/*"
                  onChange={handleFileInputChange}
                  disabled={isUploading}
                />
              </div>
              {isUploading && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {isVideoFile(uploadedFile) ? (
                    <FileVideo className="h-8 w-8 text-blue-500" />
                  ) : (
                    <FileAudio className="h-8 w-8 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {previewUrl && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Preview</h4>
                  {isVideoFile(uploadedFile) ? (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full max-w-md mx-auto rounded"
                      style={{ maxHeight: '300px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <audio
                      src={previewUrl}
                      controls
                      className="w-full max-w-md mx-auto"
                    >
                      Your browser does not support the audio tag.
                    </audio>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadTab;
