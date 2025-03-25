
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export interface MediaFile {
  id: string;
  title: string;
  description?: string | null;
  filename?: string | null;
  created_at: string;
  file_size?: number | null;
  duration?: number | null;
  type: 'video' | 'audio';
  url?: string;
}

interface MediaSelectorProps {
  title: string;
  description: string;
  mediaType: 'video' | 'audio';
  onFileSelected: (file: File) => void;
  onFileFromLibrarySelected?: (media: MediaFile) => void;
  mediaFiles?: MediaFile[];
  selectedMedia?: MediaFile | null;
  isLoading?: boolean;
  isUploading?: boolean;
  setIsUploading?: (isUploading: boolean) => void;
  uploadProgress?: number;
  onUploadComplete?: () => void;
  onCancel?: () => void;
  acceptTypes?: string;
}

const MediaSelector = ({
  title,
  description,
  mediaType,
  onFileSelected,
  onFileFromLibrarySelected,
  mediaFiles = [],
  selectedMedia,
  isLoading = false,
  isUploading = false,
  setIsUploading,
  uploadProgress = 0,
  onUploadComplete,
  onCancel,
  acceptTypes = mediaType === 'video' ? "video/*" : "audio/*"
}: MediaSelectorProps) => {
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      if (setIsUploading) {
        setIsUploading(true);
      }
      
      // Simulate upload progress
      let uploadProgress = 0;
      const progressInterval = setInterval(() => {
        uploadProgress += 5;
        setProgress(uploadProgress);
        
        if (uploadProgress >= 95) {
          clearInterval(progressInterval);
        }
      }, 300);
      
      // Call the parent handler
      onFileSelected(selectedFile);
      
      // Complete the progress
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          if (setIsUploading) {
            setIsUploading(false);
          }
          setProgress(0);
          setUploadDialogOpen(false);
          if (onUploadComplete) {
            onUploadComplete();
          }
        }, 500);
      }, 2000);
    }
  };

  const handleMediaDelete = (media: MediaFile) => {
    // This would be implemented in the parent component
    toast('Media delete functionality should be implemented in parent component');
  };

  const MediaIcon = mediaType === 'video' ? Video : FileText;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedMedia ? (
          <div className="space-y-4">
            <div className="bg-muted rounded overflow-hidden relative aspect-video">
              {mediaType === 'video' && selectedMedia.url ? (
                <video 
                  src={selectedMedia.url} 
                  className="w-full h-full object-contain" 
                  controls
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <MediaIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">{selectedMedia.title}</h3>
              <p className="text-sm text-muted-foreground">
                Size: {selectedMedia.file_size ? `${(selectedMedia.file_size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">
                Uploaded: {new Date(selectedMedia.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <MediaIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">No {mediaType} selected</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please select a {mediaType} from your library or upload a new one
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Dialog open={libraryDialogOpen} onOpenChange={setLibraryDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Select from Library
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Your {mediaType === 'video' ? 'Videos' : 'Audio Files'}</DialogTitle>
                    <DialogDescription>
                      Select a {mediaType} from your library
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading your {mediaType} files...</p>
                      </div>
                    ) : mediaFiles && mediaFiles.length > 0 ? (
                      <div className="space-y-4">
                        {mediaFiles.map((media) => (
                          <div 
                            key={media.id} 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => {
                              if (onFileFromLibrarySelected) {
                                onFileFromLibrarySelected(media);
                              }
                              setLibraryDialogOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                <MediaIcon className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium">{media.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(media.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMediaDelete(media);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 h-4 w-4 text-muted-foreground hover:text-red-500"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No {mediaType} files found in your library</p>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setLibraryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        setLibraryDialogOpen(false);
                        setUploadDialogOpen(true);
                      }}
                    >
                      Upload New
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-youtube-red hover:bg-youtube-darkred">
                    Upload New {mediaType === 'video' ? 'Video' : 'Audio'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New {mediaType === 'video' ? 'Video' : 'Audio'}</DialogTitle>
                    <DialogDescription>
                      Upload a {mediaType} to get started
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                      {isUploading ? (
                        <div className="space-y-4">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                          </div>
                          <div>
                            <p className="font-medium">Uploading {mediaType}...</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {progress}% complete
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-youtube-red h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Drag and drop or click to upload</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {mediaType === 'video' 
                                ? 'Supports MP4, MOV, AVI up to 500MB' 
                                : 'Supports MP3, WAV, AAC up to 100MB'}
                            </p>
                          </div>
                          <Input 
                            id="media-upload" 
                            type="file" 
                            accept={acceptTypes}
                            className="hidden" 
                            onChange={handleFileChange}
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => document.getElementById('media-upload')?.click()}
                          >
                            Select {mediaType === 'video' ? 'Video' : 'Audio'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadDialogOpen(false)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={!selectedMedia}
        >
          Deselect
        </Button>
        <Button 
          variant="default"
          disabled={!selectedMedia}
          className="bg-youtube-red hover:bg-youtube-darkred"
          onClick={onUploadComplete}
        >
          Next Step
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MediaSelector;
