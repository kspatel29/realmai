
import React from "react";
import { useSubtitleJobs } from "@/hooks/useSubtitleJobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Copy, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const SubtitleJobsList = () => {
  const { jobs, isLoading, refreshJobs } = useSubtitleJobs();

  const copyPreviewToClipboard = (text: string | null) => {
    if (!text) {
      toast.error("No preview text available");
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Preview text copied to clipboard"))
      .catch(() => toast.error("Failed to copy preview text"));
  };

  const handleRefresh = async () => {
    const success = await refreshJobs();
    if (success) {
      toast.success("Subtitle jobs refreshed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "starting":
      case "processing":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case "succeeded":
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case "failed":
      case "error":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No subtitle jobs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium truncate">
                  {job.original_filename || "Audio file"}
                </CardTitle>
                {getStatusBadge(job.status)}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(job.created_at), "PPp")}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Model:</span>
                  <span>{job.model_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Language:</span>
                  <span>{job.language || "Auto-detect"}</span>
                </div>
                {job.error && (
                  <div className="flex justify-between text-red-500">
                    <span className="font-medium">Error:</span>
                    <span className="truncate max-w-[70%]">{job.error}</span>
                  </div>
                )}
                {job.preview_text && (
                  <div className="mt-2">
                    <div className="font-medium mb-1">Preview:</div>
                    <div className="bg-muted p-2 rounded-md text-xs max-h-20 overflow-y-auto">
                      {job.preview_text.slice(0, 150)}
                      {job.preview_text.length > 150 ? '...' : ''}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              {job.preview_text && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyPreviewToClipboard(job.preview_text)}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy Text
                </Button>
              )}
              {job.srt_url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(job.srt_url, '_blank')}
                >
                  <FileDown className="h-4 w-4 mr-1" /> SRT
                </Button>
              )}
              {job.vtt_url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(job.vtt_url, '_blank')}
                >
                  <FileDown className="h-4 w-4 mr-1" /> VTT
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubtitleJobsList;
