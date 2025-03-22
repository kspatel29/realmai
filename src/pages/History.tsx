import { useState, useEffect, useRef } from "react";
import { useDubbingJobs } from "@/hooks/dubbingJobs";
import { useSubtitleJobs } from "@/hooks/useSubtitleJobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Clock, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Video, 
  Play, 
  Pause, 
  Link2,
  FileText,
  Headphones
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const History = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [isLoaded, setIsLoaded] = useState(false);
  const [manualUrlOpen, setManualUrlOpen] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  
  const { 
    jobs: dubbingJobs, 
    isLoading: isDubbingLoading, 
    error: dubbingError, 
    refreshJobStatus,
    updateJobWithUrl,
    isUpdating: isDubbingUpdating
  } = useDubbingJobs();
  const [selectedDubbingJob, setSelectedDubbingJob] = useState<typeof dubbingJobs[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { 
    jobs: subtitleJobs, 
    isLoading: isSubtitleLoading, 
    error: subtitleError, 
    refreshJobs: refreshSubtitleJobs 
  } = useSubtitleJobs();
  const [selectedSubtitleJob, setSelectedSubtitleJob] = useState<typeof subtitleJobs[0] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isDubbingLoading && !isDubbingUpdating) {
      console.log("Initial refresh of job statuses");
      refreshJobStatus();
    }
    
    if (!isSubtitleLoading) {
      refreshSubtitleJobs();
    }
    
    const intervalId = setInterval(() => {
      const hasActiveDubbingJobs = dubbingJobs.some(job => job.status === "queued" || job.status === "running");
      if (hasActiveDubbingJobs && !isDubbingUpdating) {
        console.log("Auto-refreshing dubbing job statuses for active jobs");
        refreshJobStatus();
      }
      
      const hasActiveSubtitleJobs = subtitleJobs.some(job => job.status === "starting" || job.status === "processing");
      if (hasActiveSubtitleJobs) {
        console.log("Auto-refreshing subtitle job statuses for active jobs");
        refreshSubtitleJobs();
      }
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [
    isDubbingLoading, 
    isDubbingUpdating, 
    isSubtitleLoading, 
    refreshJobStatus, 
    refreshSubtitleJobs, 
    dubbingJobs, 
    subtitleJobs
  ]);

  useEffect(() => {
    if (dubbingJobs.length > 0 && !selectedDubbingJob) {
      const completedJob = dubbingJobs.find(job => job.status === "succeeded");
      setSelectedDubbingJob(completedJob || dubbingJobs[0]);
    }
    
    if (selectedDubbingJob) {
      const updatedJob = dubbingJobs.find(job => job.id === selectedDubbingJob.id);
      if (updatedJob && updatedJob !== selectedDubbingJob) {
        setSelectedDubbingJob(updatedJob);
        
        if (updatedJob.status === "succeeded" && selectedDubbingJob.status !== "succeeded") {
          toast.success("Your video has been successfully dubbed!");
        } else if (updatedJob.status === "failed" && selectedDubbingJob.status !== "failed") {
          toast.error("An error occurred while processing your video");
        }
      }
    }
  }, [dubbingJobs, selectedDubbingJob]);

  useEffect(() => {
    if (subtitleJobs.length > 0 && !selectedSubtitleJob) {
      const completedJob = subtitleJobs.find(job => job.status === "succeeded");
      setSelectedSubtitleJob(completedJob || subtitleJobs[0]);
    }
    
    if (selectedSubtitleJob) {
      const updatedJob = subtitleJobs.find(job => job.id === selectedSubtitleJob.id);
      if (updatedJob && updatedJob !== selectedSubtitleJob) {
        setSelectedSubtitleJob(updatedJob);
        
        if (updatedJob.status === "succeeded" && selectedSubtitleJob.status !== "succeeded") {
          toast.success("Your subtitles have been successfully generated!");
        } else if (updatedJob.status === "failed" && selectedSubtitleJob.status !== "failed") {
          toast.error("An error occurred while generating your subtitles");
        }
      }
    }
  }, [subtitleJobs, selectedSubtitleJob]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "running":
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "queued":
      case "starting":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4" />;
      case "running":
      case "processing":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "queued":
      case "starting":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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

  const handleRefresh = () => {
    if (activeTab === "videos") {
      toast.info("Refreshing video dubbing job statuses...");
      refreshJobStatus();
    } else {
      toast.info("Refreshing subtitle job statuses...");
      refreshSubtitleJobs();
    }
  };

  const handleManualUrlSubmit = async () => {
    if (!selectedDubbingJob || !manualUrl) return;
    
    setIsUpdatingUrl(true);
    
    try {
      const success = await updateJobWithUrl(selectedDubbingJob.sieve_job_id, manualUrl);
      
      if (success) {
        toast.success("Job updated with the provided URL!");
        setManualUrlOpen(false);
        setManualUrl("");
      } else {
        toast.error("Failed to update the job. Please check the URL.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the job");
      console.error("Error updating job URL:", error);
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  const showSubtitlePreview = (content: string) => {
    setPreviewContent(content);
    setIsPreviewDialogOpen(true);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  return (
    <div className={`space-y-8 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">
            View and manage your past jobs and activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
            disabled={isDubbingUpdating || isSubtitleLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isDubbingUpdating || isSubtitleLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {activeTab === "videos" && selectedDubbingJob && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setManualUrlOpen(true)}
            >
              <Link2 className="h-4 w-4" />
              Set URL
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Dubbing
          </TabsTrigger>
          <TabsTrigger value="subtitles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Subtitles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Dubbing Jobs</CardTitle>
                  <CardDescription>
                    All your video dubbing jobs and their statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isDubbingLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dubbingJobs.length > 0 ? (
                    <div className="divide-y">
                      {dubbingJobs.map((job) => (
                        <div 
                          key={job.id} 
                          className={`py-4 first:pt-0 last:pb-0 cursor-pointer ${selectedDubbingJob?.id === job.id ? 'bg-slate-50 dark:bg-slate-900/20 -mx-6 px-6' : ''}`}
                          onClick={() => setSelectedDubbingJob(job)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                <Video className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium">Job {job.sieve_job_id.slice(0, 8)}</div>
                                <div className="text-sm text-muted-foreground">
                                  Created: {formatDate(job.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`rounded-full px-3 py-1 text-xs flex items-center gap-1.5 ${getStatusColor(job.status)}`}>
                                {getStatusIcon(job.status)}
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </div>
                              {job.languages && (
                                <div className="hidden sm:flex gap-1">
                                  {job.languages.map((lang, index) => (
                                    <span key={index} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                      {lang}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {job.output_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={job.output_url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">Download</span>
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          {job.error && (
                            <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
                              Error: {job.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium">No dubbing jobs found</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't created any dubbing jobs yet
                      </p>
                      <Button asChild>
                        <a href="/dashboard/video-dubbing">Create a Dubbing Job</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Job Preview</CardTitle>
                  <CardDescription>
                    {selectedDubbingJob ? 
                      selectedDubbingJob.status === "succeeded" ? "Watch your dubbed video" :
                      selectedDubbingJob.status === "failed" ? "This job encountered an error" :
                      "This job is still being processed" : 
                      "Select a job to preview"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedDubbingJob ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <Video className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        Select a job to see details
                      </p>
                    </div>
                  ) : selectedDubbingJob.status === "succeeded" && selectedDubbingJob.output_url ? (
                    <div className="space-y-4">
                      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <video 
                          id="history-video"
                          ref={videoRef}
                          src={selectedDubbingJob.output_url}
                          className="w-full h-full object-contain"
                          controls
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        />
                      </div>
                      <div className="flex justify-between">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="h-4 w-4" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" /> Play
                            </>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          className="gap-1 bg-youtube-red hover:bg-youtube-darkred"
                          asChild
                        >
                          <a href={selectedDubbingJob.output_url} target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4" /> Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : selectedDubbingJob.status === "failed" ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                      <h4 className="text-red-800 dark:text-red-400 font-medium mb-2">Processing Error</h4>
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        {selectedDubbingJob.error || "An unknown error occurred during processing."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      {selectedDubbingJob.status === "running" ? (
                        <>
                          <RefreshCw className="h-12 w-12 text-muted-foreground mb-3 animate-spin" />
                          <p className="text-muted-foreground">
                            This job is currently processing...
                          </p>
                        </>
                      ) : (
                        <>
                          <Clock className="h-12 w-12 text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">
                            This job is queued for processing
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subtitles" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Subtitle Jobs</CardTitle>
                  <CardDescription>
                    All your subtitle generation jobs and their statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubtitleLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : subtitleJobs.length > 0 ? (
                    <div className="divide-y">
                      {subtitleJobs.map((job) => (
                        <div 
                          key={job.id} 
                          className={`py-4 first:pt-0 last:pb-0 cursor-pointer ${selectedSubtitleJob?.id === job.id ? 'bg-slate-50 dark:bg-slate-900/20 -mx-6 px-6' : ''}`}
                          onClick={() => setSelectedSubtitleJob(job)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                <FileText className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {job.original_filename ? 
                                    job.original_filename.length > 20 
                                      ? job.original_filename.substring(0, 20) + '...' 
                                      : job.original_filename
                                    : `Subtitles ${job.id.slice(0, 8)}`
                                  }
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Created: {formatDate(job.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`rounded-full px-3 py-1 text-xs flex items-center gap-1.5 ${getStatusColor(job.status)}`}>
                                {getStatusIcon(job.status)}
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </div>
                              {job.language && (
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                  {job.language.toUpperCase()}
                                </span>
                              )}
                              {job.srt_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={job.srt_url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">SRT</span>
                                  </a>
                                </Button>
                              )}
                              {job.vtt_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={job.vtt_url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">VTT</span>
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          {job.error && (
                            <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
                              Error: {job.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium">No subtitle jobs found</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't created any subtitle generation jobs yet
                      </p>
                      <Button asChild>
                        <a href="/dashboard/subtitles">Generate Subtitles</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Job Preview</CardTitle>
                  <CardDescription>
                    {selectedSubtitleJob ? 
                      selectedSubtitleJob.status === "succeeded" ? "Preview your subtitles" :
                      selectedSubtitleJob.status === "failed" ? "This job encountered an error" :
                      "This job is still being processed" : 
                      "Select a job to preview"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedSubtitleJob ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        Select a job to see details
                      </p>
                    </div>
                  ) : selectedSubtitleJob.status === "succeeded" && (selectedSubtitleJob.srt_url || selectedSubtitleJob.vtt_url) ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSubtitleJob.srt_url && (
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            asChild
                          >
                            <a href={selectedSubtitleJob.srt_url} target="_blank" rel="noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Download SRT
                            </a>
                          </Button>
                        )}
                        {selectedSubtitleJob.vtt_url && (
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            asChild
                          >
                            <a href={selectedSubtitleJob.vtt_url} target="_blank" rel="noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Download VTT
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      {selectedSubtitleJob.preview_text && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">Preview</h3>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => showSubtitlePreview(selectedSubtitleJob.preview_text!)}
                              >
                                <FileText className="h-4 w-4 mr-1" /> View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(selectedSubtitleJob.preview_text!)}
                              >
                                <FileText className="h-4 w-4 mr-1" /> Copy
                              </Button>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md h-[150px] overflow-y-auto">
                            <p className="text-sm font-mono whitespace-pre-line">
                              {selectedSubtitleJob.preview_text.substring(0, 300)}
                              {selectedSubtitleJob.preview_text.length > 300 && '...'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : selectedSubtitleJob.status === "failed" ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                      <h4 className="text-red-800 dark:text-red-400 font-medium mb-2">Processing Error</h4>
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        {selectedSubtitleJob.error || "An unknown error occurred during processing."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      {selectedSubtitleJob.status === "processing" ? (
                        <>
                          <RefreshCw className="h-12 w-12 text-muted-foreground mb-3 animate-spin" />
                          <p className="text-muted-foreground">
                            Your subtitles are currently being generated...
                          </p>
                        </>
                      ) : (
                        <>
                          <Clock className="h-12 w-12 text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">
                            This job is queued for processing
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={manualUrlOpen} onOpenChange={setManualUrlOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job URL</DialogTitle>
            <DialogDescription>
              If you have a direct URL to the dubbed video output, you can update the job manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">Video URL</Label>
              <Input 
                id="url" 
                placeholder="https://..." 
                value={manualUrl} 
                onChange={(e) => setManualUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste the URL provided by the API response.
              </p>
            </div>
            {selectedDubbingJob && (
              <div className="text-sm">
                <p>Job ID: {selectedDubbingJob.sieve_job_id}</p>
                <p>Current status: {selectedDubbingJob.status}</p>
                {selectedDubbingJob.output_url && (
                  <p className="truncate">Current URL: {selectedDubbingJob.output_url}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setManualUrlOpen(false)}
              disabled={isUpdatingUrl}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleManualUrlSubmit}
              disabled={!manualUrl || isUpdatingUrl}
            >
              {isUpdatingUrl ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : "Update Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Subtitle Preview</DialogTitle>
            <DialogDescription>
              Preview the generated subtitles
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={previewContent} 
              readOnly 
              className="h-[300px] font-mono text-sm"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPreviewDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => copyToClipboard(previewContent)}
            >
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
