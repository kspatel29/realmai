import { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  Globe,
  RefreshCw,
  Link2
} from "lucide-react";
import { SieveLanguage, SUPPORTED_LANGUAGES } from "@/services/sieveApi";
import { DubbingJob, useDubbingJobs } from "@/hooks/dubbingJobs";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DubbingJobsListProps {
  jobs: DubbingJob[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function DubbingJobsList({ jobs, onRefresh, isLoading }: DubbingJobsListProps) {
  const [selectedJob, setSelectedJob] = useState<DubbingJob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [manualUrlOpen, setManualUrlOpen] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { updateJobWithUrl } = useDubbingJobs();

  useEffect(() => {
    if (!selectedJob && jobs.length > 0) {
      const completedJob = jobs.find(job => job.status === "succeeded");
      if (completedJob) {
        setSelectedJob(completedJob);
      } else {
        setSelectedJob(jobs[0]);
      }
    }
    
    if (selectedJob && !jobs.find(job => job.id === selectedJob.id) && jobs.length > 0) {
      setSelectedJob(jobs[0]);
    }
    
    if (selectedJob) {
      const updatedJob = jobs.find(job => job.id === selectedJob.id);
      if (updatedJob && JSON.stringify(updatedJob) !== JSON.stringify(selectedJob)) {
        setSelectedJob(updatedJob);
      }
    }
  }, [jobs, selectedJob]);

  useEffect(() => {
    videoRef.current = document.getElementById("preview-video") as HTMLVideoElement;
    
    const hasActiveJobs = jobs.some(job => job.status === "queued" || job.status === "running");
    if (hasActiveJobs && !isLoading) {
      console.log("Automatically refreshing job statuses due to active jobs");
      onRefresh();
    }
    
    if (selectedJob && (selectedJob.status === "queued" || selectedJob.status === "running") && !isLoading) {
      console.log(`Selected job ${selectedJob.sieve_job_id} is active, refreshing status`);
      onRefresh();
    }
  }, [selectedJob, isLoading, onRefresh, jobs]);

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

  const getLanguageInfo = (code: string): SieveLanguage | undefined => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Badge className="bg-green-500"><CheckCircle2 className="mr-1 h-3 w-3" /> Completed</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Failed</Badge>;
      case "running":
        return <Badge className="bg-blue-500"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing</Badge>;
      case "queued":
      default:
        return <Badge variant="outline" className="border-amber-500 text-amber-500"><Clock className="mr-1 h-3 w-3" /> Queued</Badge>;
    }
  };

  const getProgressValue = (status: string): number => {
    switch (status) {
      case "succeeded":
        return 100;
      case "failed":
        return 100;
      case "running":
        return 65;
      case "queued":
      default:
        return 25;
    }
  };

  const handleRefresh = () => {
    console.log("Manual refresh requested by user");
    toast.info("Refreshing job statuses...");
    onRefresh();
  };

  const handleManualUrlSubmit = async () => {
    if (!selectedJob || !manualUrl) return;
    
    setIsUpdatingUrl(true);
    
    try {
      const success = await updateJobWithUrl(selectedJob.sieve_job_id, manualUrl);
      
      if (success) {
        toast.success("Job updated with the provided URL!");
        setManualUrlOpen(false);
        setManualUrl("");
        onRefresh();
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

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Globe className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium">No dubbing jobs yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a video and generate dubs to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Dubbing Jobs</h3>
        <div className="flex gap-2">
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
          {selectedJob && (
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-3">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              className={`cursor-pointer hover:border-youtube-red/50 transition-colors ${selectedJob?.id === job.id ? 'border-youtube-red' : ''}`}
              onClick={() => setSelectedJob(job)}
            >
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base truncate">
                      Job #{job.sieve_job_id.substring(0, 8)}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(job.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Processing: {getProgressValue(job.status)}%
                  </div>
                  <Progress value={getProgressValue(job.status)} className="h-2" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.languages.map(lang => {
                    const language = getLanguageInfo(lang);
                    return language ? (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {language.flag} {language.name}
                      </Badge>
                    ) : (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                {selectedJob ? (
                  <>
                    Preview Job #{selectedJob.sieve_job_id.substring(0, 8)}
                    {getStatusBadge(selectedJob.status)}
                  </>
                ) : "Video Preview"}
              </CardTitle>
              <CardDescription>
                {selectedJob?.status === "succeeded" 
                  ? "Your dubbed video is ready to preview and download"
                  : selectedJob?.status === "failed"
                  ? "This job encountered an error during processing"
                  : "This job is still being processed"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {selectedJob?.status === "succeeded" && selectedJob.output_url ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    id="preview-video"
                    src={selectedJob.output_url}
                    className="w-full h-full object-contain"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              ) : selectedJob?.status === "failed" ? (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <h4 className="text-red-800 dark:text-red-400 font-medium mb-2">Processing Error</h4>
                  <p className="text-red-700 dark:text-red-500 text-sm">
                    {selectedJob.error || "An unknown error occurred during processing. Please try again."}
                  </p>
                </div>
              ) : (
                <div className="relative aspect-video bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                  {selectedJob?.status === "running" ? (
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-youtube-red" />
                      <p className="text-muted-foreground">Processing your video...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Waiting to start processing...</p>
                    </div>
                  )}
                </div>
              )}

              {selectedJob?.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.languages.map(lang => {
                      const language = getLanguageInfo(lang);
                      return language ? (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {language.flag} {language.name}
                        </Badge>
                      ) : (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-end">
              {selectedJob?.status === "succeeded" && selectedJob.output_url && (
                <Button
                  variant="default"
                  className="bg-youtube-red hover:bg-youtube-darkred"
                  onClick={() => window.open(selectedJob.output_url, "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

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
              <Label htmlFor="dubbing-url">Video URL</Label>
              <Input 
                id="dubbing-url" 
                placeholder="https://..." 
                value={manualUrl} 
                onChange={(e) => setManualUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste the URL provided by the API response.
              </p>
            </div>
            {selectedJob && (
              <div className="text-sm">
                <p>Job ID: {selectedJob.sieve_job_id}</p>
                <p>Current status: {selectedJob.status}</p>
                {selectedJob.output_url && (
                  <p className="truncate">Current URL: {selectedJob.output_url}</p>
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
    </div>
  );
}
