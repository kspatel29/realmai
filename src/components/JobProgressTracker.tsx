
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUnifiedJobManager } from "@/hooks/useUnifiedJobManager";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  RefreshCw,
  X
} from "lucide-react";
import { format } from "date-fns";

const JobProgressTracker = () => {
  const { allJobs, isLoading, refreshJobs, cancelJob } = useUnifiedJobManager();

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      case 'starting':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'failed':
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
      case 'starting':
        return <Badge className="bg-blue-500">Processing</Badge>;
      default:
        return <Badge variant="outline">Queued</Badge>;
    }
  };

  const getJobProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return 100;
      case 'failed':
      case 'error':
        return 100;
      case 'processing':
        return 65;
      case 'starting':
        return 25;
      default:
        return 10;
    }
  };

  const getJobTitle = (job: any) => {
    switch (job.type) {
      case 'dubbing':
        return `Video Dubbing (${job.metadata?.languages?.length || 0} languages)`;
      case 'subtitles':
        return `Subtitle Generation (${job.metadata?.model_name || 'Unknown model'})`;
      case 'video_generation':
        return 'Video Generation';
      default:
        return 'Unknown Job';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading jobs...</span>
        </CardContent>
      </Card>
    );
  }

  if (!allJobs.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Job Progress
            <Button variant="outline" size="sm" onClick={refreshJobs}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            No jobs found. Start processing some content to see progress here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Job Progress ({allJobs.length})
          <Button variant="outline" size="sm" onClick={refreshJobs}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Track the progress of your AI processing jobs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {allJobs.slice(0, 5).map((job) => (
          <div key={job.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(job.status)}
                <div>
                  <h4 className="font-medium text-sm">{getJobTitle(job)}</h4>
                  <p className="text-xs text-muted-foreground">
                    Started {format(new Date(job.created_at), 'MMM d, HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(job.status)}
                {(job.status === 'processing' || job.status === 'starting') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelJob.mutate(job.id)}
                    disabled={cancelJob.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{getJobProgress(job.status)}%</span>
              </div>
              <Progress value={getJobProgress(job.status)} className="h-2" />
            </div>

            {job.error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-2">
                <p className="text-red-700 dark:text-red-400 text-xs">
                  Error: {job.error}
                </p>
              </div>
            )}
          </div>
        ))}
        
        {allJobs.length > 5 && (
          <div className="text-center">
            <Button variant="outline" size="sm">
              View All Jobs ({allJobs.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobProgressTracker;
