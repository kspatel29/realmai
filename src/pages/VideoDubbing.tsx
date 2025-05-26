
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Play, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { submitVideoDubbing } from "@/services/api";
import { useDubbingJobs } from "@/hooks/dubbingJobs";
import { useDubbingVideos } from "@/hooks/useDubbingVideos";
import { useToast } from "@/hooks/use-toast";

const VideoDubbing = () => {
  const { jobs, createJob, refreshJobStatus, isUpdating } = useDubbingJobs();
  const { 
    videos: dubbingVideos, 
    isLoading: isLoadingVideos, 
    uploadVideo,
    markAsUsed,
    getVideoUrl
  } = useDubbingVideos();
  
  const { toast: showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState("english");
  const [enableVoiceCloning, setEnableVoiceCloning] = useState(true);
  const [enableLipsyncing, setEnableLipsyncing] = useState(false);
  const [preserveBackgroundAudio, setPreserveBackgroundAudio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get videos that haven't been used in jobs yet
  const availableVideos = dubbingVideos.filter(video => !video.used_in_dubbing_job);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshJobStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshJobStatus]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setSelectedVideo("");
        
        // Get video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setVideoDuration(video.duration);
          URL.revokeObjectURL(video.src);
        };
        video.onerror = () => {
          console.error("Error loading video metadata");
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
      } else {
        toast.error("Please select a valid video file.");
      }
    }
  };

  const handleVideoSelect = async (videoId: string) => {
    const video = dubbingVideos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(videoId);
      setSelectedFile(null);
      setVideoDuration(video.duration || null);
    }
  };

  const uploadAndSubmitDubbing = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const fileNameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
      
      // Upload video for dubbing
      const uploadedVideo = await uploadVideo.mutateAsync({
        file: selectedFile,
        title: fileNameWithoutExt
      });

      // Use the uploaded video URL for dubbing
      await submitDubbingWithVideo(uploadedVideo.video_url, uploadedVideo.id);
      
    } catch (error) {
      console.error('Upload and dubbing error:', error);
      toast.error(`Failed to upload and process video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const submitDubbingWithVideo = async (videoUrl: string, videoId?: string) => {
    try {
      const dubbingOptions = {
        target_language: targetLanguage,
        enable_voice_cloning: enableVoiceCloning,
        preserve_background_audio: preserveBackgroundAudio,
        enable_lipsyncing: enableLipsyncing,
      };

      console.log('Submitting dubbing job with languages:', targetLanguage);
      
      const dubbingResponse = await submitVideoDubbing(videoUrl, dubbingOptions);
      console.log('Dubbing job submitted successfully:', dubbingResponse);
      console.log('Dubbing job submitted successfully, Sieve job ID:', dubbingResponse.id);

      // Create job record in database
      const jobData = {
        sieve_job_id: dubbingResponse.id,
        status: dubbingResponse.status || 'queued',
        languages: [targetLanguage],
      };

      const dbJob = await createJob.mutateAsync(jobData);
      console.log('Job created in database:', dbJob);

      // Mark video as used if it's from library
      if (videoId) {
        await markAsUsed.mutateAsync({ 
          videoId: videoId, 
          dubbingJobId: dbJob.id 
        });
      }

      // Clear selections
      setSelectedFile(null);
      setSelectedVideo("");
      setVideoDuration(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      showToast({
        title: "Dubbing job submitted",
        description: "Your video is being processed. Check the History tab for updates.",
      });

      // Refresh job statuses
      setTimeout(() => {
        refreshJobStatus();
      }, 2000);

    } catch (error) {
      console.error('Dubbing submission error:', error);
      toast.error(`Failed to submit dubbing job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSubmitDubbing = async () => {
    if (selectedFile) {
      await uploadAndSubmitDubbing();
    } else if (selectedVideo) {
      try {
        const videoUrl = await getVideoUrl(selectedVideo);
        await submitDubbingWithVideo(videoUrl, selectedVideo);
      } catch (error) {
        console.error('Error getting video URL:', error);
        toast.error('Failed to get video URL for dubbing');
      }
    } else {
      toast.error("Please select a video file or choose from your library.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const canSubmit = (selectedFile || selectedVideo) && targetLanguage;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Video Dubbing</h1>
        <p className="text-muted-foreground">
          Upload a video or select from your library to create dubbed versions in different languages.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Video</CardTitle>
            <CardDescription>
              Upload a video file from your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> a video file
                  </p>
                  <p className="text-xs text-gray-500">MP4, AVI, MOV (MAX. 100MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  id="video-upload"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{selectedFile.name}</span>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {formatFileSize(selectedFile.size)}
                  {videoDuration && ` • ${formatDuration(videoDuration)}`}
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select from Library</CardTitle>
            <CardDescription>
              Choose a previously uploaded video
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingVideos ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : availableVideos.length > 0 ? (
              <div className="space-y-2">
                <Label>Available Videos</Label>
                <Select value={selectedVideo} onValueChange={handleVideoSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a video" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVideos.map((video) => (
                      <SelectItem key={video.id} value={video.id}>
                        <div className="flex flex-col">
                          <span>{video.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(video.file_size)}
                            {video.duration && ` • ${formatDuration(video.duration)}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No videos available in your library.</p>
                <p className="text-sm">Upload a video to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dubbing Settings</CardTitle>
          <CardDescription>
            Configure your dubbing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target-language">Target Language</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="portuguese">Portuguese</SelectItem>
                  <SelectItem value="russian">Russian</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="korean">Korean</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="voice-cloning"
                checked={enableVoiceCloning}
                onCheckedChange={setEnableVoiceCloning}
              />
              <Label htmlFor="voice-cloning">Enable Voice Cloning</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lipsyncing"
                checked={enableLipsyncing}
                onCheckedChange={setEnableLipsyncing}
              />
              <Label htmlFor="lipsyncing">Enable Lip Syncing</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="background-audio"
                checked={preserveBackgroundAudio}
                onCheckedChange={setPreserveBackgroundAudio}
              />
              <Label htmlFor="background-audio">Preserve Background Audio</Label>
            </div>
          </div>

          <Button
            onClick={handleSubmitDubbing}
            disabled={!canSubmit || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Start Dubbing"
            )}
          </Button>
        </CardContent>
      </Card>

      {jobs.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Dubbing Jobs</CardTitle>
              <CardDescription>
                Your latest dubbing requests and their status
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshJobStatus}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Languages: {job.languages.join(", ")}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === "succeeded" ? "bg-green-100 text-green-800" :
                      job.status === "failed" ? "bg-red-100 text-red-800" :
                      job.status === "running" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {job.status}
                    </span>
                    {job.output_url && (
                      <div className="mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(job.output_url, '_blank')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoDubbing;
