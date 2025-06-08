
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCcw, Download, AlertCircle, CheckCircle, PlayCircle } from "lucide-react";
import { extractLanguageName } from "@/lib/language-utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SubtitleJob {
  id: string;
  status: string;
  srt_url?: string;
  vtt_url?: string;
  language?: string;
  model_name: string;
  original_filename?: string;
  created_at: string;
  updated_at: string;
  error?: string;
}

const SubtitleJobsList = () => {
  const { toast } = useToast();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const refreshTimeoutRef = useRef<number | null>(null);

  // Fetch subtitle jobs using React Query
  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['subtitle-jobs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('subtitle_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SubtitleJob[];
    },
    refetchInterval: (query) => {
      // Only refetch if there are running jobs
      const jobsData = query.state.data;
      const hasRunningJobs = jobsData?.some(job => job.status === "queued" || job.status === "running");
      return hasRunningJobs ? 5000 : false;
    }
  });

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
    
    refetch();
    setLastRefreshed(new Date());
    toast({
      title: "Jobs refreshed",
      description: "The job status has been refreshed."
    });
  };

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (jobs.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No subtitle jobs found</p>
        <p className="text-sm text-muted-foreground">Start a new subtitle generation job to see it here</p>
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
                <h3 className="font-medium">File</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {job.original_filename || 'Unknown file'}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.language && (
                    <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                      {extractLanguageName(job.language)}
                    </span>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-0.5">
                    {job.model_name}
                  </span>
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
              
              <div className="flex items-center justify-end gap-2">
                {job.status === "completed" && (job.srt_url || job.vtt_url) && (
                  <>
                    {job.srt_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(job.srt_url!, `subtitles_${job.id}.srt`)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        SRT
                      </Button>
                    )}
                    {job.vtt_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(job.vtt_url!, `subtitles_${job.id}.vtt`)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        VTT
                      </Button>
                    )}
                  </>
                )}
                {job.status === "failed" && (
                  <p className="text-sm text-red-600">{job.error || "Processing failed"}</p>
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

export default SubtitleJobsList;
