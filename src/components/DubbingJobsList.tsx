
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCcw, Download, AlertCircle, CheckCircle, PlayCircle } from "lucide-react";
import { extractLanguageName } from "@/lib/language-utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface DubbingJob {
  id: string;
  sieve_job_id: string;
  languages: string[];
  status: string;
  output_url?: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

interface DubbingJobsListProps {
  jobs: DubbingJob[];
  onRefresh: () => void;
  isLoading: boolean;
}

const DubbingJobsList = ({ jobs, onRefresh, isLoading }: DubbingJobsListProps) => {
  const { toast } = useToast();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const hasRunningJobs = jobs.some(job => job.status === "queued" || job.status === "running");
  const refreshTimeoutRef = useRef<number | null>(null);
  
  // Clear the timeout when unmounting
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const handleManualRefresh = () => {
    if (isLoading) return;
    
    onRefresh();
    setLastRefreshed(new Date());
    toast({
      title: "Jobs refreshed",
      description: "The job status has been refreshed."
    });
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No jobs found</p>
        <p className="text-sm text-muted-foreground">Start a new dubbing job to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Last refreshed: {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      <div className="space-y-4">
        {jobs.map(job => (
          <Card key={job.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <h3 className="font-medium">Languages</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.languages.map(language => (
                    <span 
                      key={language} 
                      className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5"
                    >
                      {extractLanguageName(language)}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Status</h3>
                <div className="flex items-center gap-1 mt-1">
                  {job.status === "running" && (
                    <span className="flex items-center text-yellow-700 bg-yellow-50 text-xs px-2 py-0.5 rounded-full">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Running
                    </span>
                  )}
                  {job.status === "queued" && (
                    <span className="flex items-center text-blue-700 bg-blue-50 text-xs px-2 py-0.5 rounded-full">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Queued
                    </span>
                  )}
                  {job.status === "completed" && (
                    <span className="flex items-center text-green-700 bg-green-50 text-xs px-2 py-0.5 rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </span>
                  )}
                  {job.status === "failed" && (
                    <span className="flex items-center text-red-700 bg-red-50 text-xs px-2 py-0.5 rounded-full">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Created</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </p>
              </div>
              
              <div className="flex items-center justify-end">
                {job.status === "completed" && job.output_url && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(job.output_url, '_blank')}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-youtube-red hover:bg-youtube-darkred"
                      onClick={() => {
                        // Create a download link
                        const a = document.createElement('a');
                        a.href = job.output_url!;
                        a.download = `dubbed_video_${job.languages.join('_')}.mp4`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
                {job.status === "failed" && job.error && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Job Failed",
                        description: job.error || "Unknown error occurred",
                        variant: "destructive"
                      });
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    See Error
                  </Button>
                )}
                {(job.status === "running" || job.status === "queued") && (
                  <p className="text-sm text-muted-foreground">Processing...</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DubbingJobsList;
