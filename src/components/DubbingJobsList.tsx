import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCcw, Download, AlertCircle, CheckCircle, PlayCircle } from "lucide-react";
import { extractLanguageName } from "@/lib/language-utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

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

interface DownloadProgress {
  [key: string]: number;
}

const DubbingJobsList = ({ jobs, onRefresh, isLoading }: DubbingJobsListProps) => {
  console.log(jobs);
  
  const { toast } = useToast();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const hasRunningJobs = jobs.some(job => job.status === "queued" || job.status === "running");
  const refreshTimeoutRef = useRef<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({});
  
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

  const handleDownload = async (job: DubbingJob) => {
    if (!job.output_url) return;

    try {
      setDownloadProgress(prev => ({ ...prev, [job.id]: 0 }));

      const response = await fetch(job.output_url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength ?? '0', 10);
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to initialize download');

      const chunks = [];
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        const progress = (loaded / total) * 100;
        setDownloadProgress(prev => ({ ...prev, [job.id]: progress }));
      }

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const filename = `dubbed_video_${job.languages.join('_')}.mp4`;

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${filename}`,
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download video",
        variant: "destructive"
      });
    } finally {
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[job.id];
        return newProgress;
      });
    }
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
                {job.status === "succeeded" && job.output_url && (
                  <div className="flex flex-col gap-2">
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
                        onClick={() => handleDownload(job)}
                        disabled={job.id in downloadProgress}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {job.id in downloadProgress ? 'Downloading...' : 'Download'}
                      </Button>
                    </div>
                    {job.id in downloadProgress && (
                      <div className="w-full">
                        <Progress value={downloadProgress[job.id]} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(downloadProgress[job.id])}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {job.status === "failed" && (
                  <p className="text-sm text-muted-foreground">Processing failed</p>
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
