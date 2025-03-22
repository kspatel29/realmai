import React, { useState, useEffect } from "react";
import { useSubtitleJobs } from "@/hooks/useSubtitleJobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  FileDown, 
  Copy, 
  RefreshCw, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Globe 
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { SubtitleJob } from "@/services/api/subtitlesService";

const SubtitleJobsList = () => {
  const { jobs, isLoading, refreshJobs } = useSubtitleJobs();
  const [selectedJob, setSelectedJob] = useState<SubtitleJob | null>(null);

  const copyPreviewToClipboard = (text) => {
    if (!text) {
      toast.error("No preview text available");
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Preview text copied to clipboard"))
      .catch(() => toast.error("Failed to copy preview text"));
  };

  const handleRefresh = async () => {
    toast.info("Refreshing subtitle jobs...");
    const success = await refreshJobs();
    if (success) {
      toast.success("Subtitle jobs refreshed");
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "starting":
      case "processing":
        return <Badge className="bg-blue-500"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing</Badge>;
      case "succeeded":
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle2 className="mr-1 h-3 w-3" /> Completed</Badge>;
      case "failed":
      case "error":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-500 text-amber-500"><Clock className="mr-1 h-3 w-3" /> Queued</Badge>;
    }
  };

  const getProgressValue = (status) => {
    switch (status.toLowerCase()) {
      case "succeeded":
      case "completed":
        return 100;
      case "failed":
      case "error":
        return 100;
      case "starting":
      case "processing":
        return 65;
      default:
        return 25;
    }
  };

  useEffect(() => {
    if (!selectedJob && jobs.length > 0) {
      const completedJob = jobs.find(job => 
        job.status.toLowerCase() === "succeeded" || 
        job.status.toLowerCase() === "completed"
      );
      if (completedJob) {
        setSelectedJob(completedJob);
      } else {
        setSelectedJob(jobs[0]);
      }
    }
    
    if (selectedJob && !jobs.find(job => job.id === selectedJob.id) && jobs.length > 0) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Globe className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium">No subtitle jobs yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload an audio file and generate subtitles to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Subtitle Jobs</h3>
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
                      {job.original_filename || "Audio file"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {format(new Date(job.created_at), "PPp")}
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
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Language:</span>
                  <span className="text-xs font-medium">{job.language || "Auto-detect"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:col-span-2">
          {selectedJob && (
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                  Preview Job {selectedJob.id.substring(0, 8)}
                  {getStatusBadge(selectedJob.status)}
                </CardTitle>
                <CardDescription>
                  {(selectedJob.status.toLowerCase() === "succeeded" || selectedJob.status.toLowerCase() === "completed") 
                    ? "Your subtitles are ready to preview and download"
                    : selectedJob.status.toLowerCase() === "failed" || selectedJob.status.toLowerCase() === "error"
                    ? "This job encountered an error during processing"
                    : "This job is still being processed"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {selectedJob.preview_text && (
                  <div className="bg-muted p-4 rounded-md text-sm max-h-60 overflow-y-auto">
                    {selectedJob.preview_text}
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Job Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Model:</div>
                    <div>{selectedJob.model_name}</div>
                    <div className="text-muted-foreground">Language:</div>
                    <div>{selectedJob.language || "Auto-detect"}</div>
                    <div className="text-muted-foreground">Created:</div>
                    <div>{format(new Date(selectedJob.created_at), "PPp")}</div>
                  </div>
                </div>
                
                {selectedJob.error && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <h4 className="text-red-800 dark:text-red-400 font-medium mb-2">Processing Error</h4>
                    <p className="text-red-700 dark:text-red-500 text-sm">
                      {selectedJob.error}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                {selectedJob.preview_text && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyPreviewToClipboard(selectedJob.preview_text)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Text
                  </Button>
                )}
                {selectedJob.srt_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(selectedJob.srt_url, '_blank')}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Download SRT
                  </Button>
                )}
                {selectedJob.vtt_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(selectedJob.vtt_url, '_blank')}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Download VTT
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubtitleJobsList;
