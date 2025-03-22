
import { useState, useEffect } from "react";
import { useDubbingJobs } from "@/hooks/useDubbingJobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Clock, Download, AlertTriangle, CheckCircle, Video, Play, Pause } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";

const History = () => {
  const { jobs, isLoading, error, refreshJobStatus, isUpdating } = useDubbingJobs();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedJob, setSelectedJob] = useState<typeof jobs[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Animation on component load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Refresh job statuses on component load
  useEffect(() => {
    if (!isLoading && !isUpdating) {
      refreshJobStatus();
    }
    
    // Set up interval to refresh active jobs
    const intervalId = setInterval(() => {
      const hasActiveJobs = jobs.some(job => job.status === "queued" || job.status === "running");
      if (hasActiveJobs && !isUpdating) {
        console.log("Auto-refreshing job statuses for active jobs");
        refreshJobStatus();
      }
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(intervalId);
  }, [isLoading, isUpdating, refreshJobStatus, jobs]);

  // Set selected job when jobs load
  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      // Prefer completed jobs when selecting
      const completedJob = jobs.find(job => job.status === "succeeded");
      setSelectedJob(completedJob || jobs[0]);
    }
    
    // If selected job updated in the jobs array, update the selected job
    if (selectedJob) {
      const updatedJob = jobs.find(job => job.id === selectedJob.id);
      if (updatedJob && updatedJob.status !== selectedJob.status) {
        setSelectedJob(updatedJob);
        
        // Show toast for job status changes
        if (updatedJob.status === "succeeded" && selectedJob.status !== "succeeded") {
          toast.success("Your video has been successfully dubbed!");
        } else if (updatedJob.status === "failed" && selectedJob.status !== "failed") {
          toast.error("An error occurred while processing your video");
        }
      }
    }
  }, [jobs, selectedJob]);

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "running":
        return "bg-blue-100 text-blue-700";
      case "queued":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4" />;
      case "running":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "queued":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Play/Pause video
  const togglePlayPause = () => {
    const video = document.getElementById("history-video") as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing job statuses...");
    refreshJobStatus();
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
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleRefresh}
          disabled={isUpdating}
        >
          <RefreshCw className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

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
              {isLoading ? (
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
              ) : jobs.length > 0 ? (
                <div className="divide-y">
                  {jobs.map((job) => (
                    <div 
                      key={job.id} 
                      className={`py-4 first:pt-0 last:pb-0 cursor-pointer ${selectedJob?.id === job.id ? 'bg-slate-50 dark:bg-slate-900/20 -mx-6 px-6' : ''}`}
                      onClick={() => setSelectedJob(job)}
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
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No jobs found</h3>
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
                {selectedJob ? 
                  selectedJob.status === "succeeded" ? "Watch your dubbed video" :
                  selectedJob.status === "failed" ? "This job encountered an error" :
                  "This job is still being processed" : 
                  "Select a job to preview"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedJob ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Video className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Select a job to see details
                  </p>
                </div>
              ) : selectedJob.status === "succeeded" && selectedJob.output_url ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video 
                      id="history-video"
                      src={selectedJob.output_url}
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
                      <a href={selectedJob.output_url} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" /> Download
                      </a>
                    </Button>
                  </div>
                </div>
              ) : selectedJob.status === "failed" ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <h4 className="text-red-800 dark:text-red-400 font-medium mb-2">Processing Error</h4>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {selectedJob.error || "An unknown error occurred during processing."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  {selectedJob.status === "running" ? (
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
    </div>
  );
};

export default History;
