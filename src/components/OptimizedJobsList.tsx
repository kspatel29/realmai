
import { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { useIntersectionObserver } from "@/hooks/usePerformanceOptimization";

interface Job {
  id: string;
  type: 'dubbing' | 'subtitles' | 'video_generation';
  status: string;
  created_at: string;
  updated_at?: string;
  metadata?: any;
  error?: string;
}

interface OptimizedJobsListProps {
  jobs: Job[];
  onJobAction?: (jobId: string, action: string) => void;
  isLoading?: boolean;
}

const JobItem = memo(({ job, onJobAction }: { job: Job; onJobAction?: (jobId: string, action: string) => void }) => {
  const intersectionRef = useIntersectionObserver(() => {
    // Could be used for analytics or lazy loading additional data
  });

  const statusColor = useMemo(() => {
    switch (job.status) {
      case 'completed':
      case 'succeeded':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
      case 'running':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }, [job.status]);

  const statusIcon = useMemo(() => {
    switch (job.status) {
      case 'completed':
      case 'succeeded':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'processing':
      case 'running':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  }, [job.status]);

  const progress = useMemo(() => {
    switch (job.status) {
      case 'completed':
      case 'succeeded':
        return 100;
      case 'processing':
      case 'running':
        return 50;
      case 'starting':
        return 25;
      default:
        return 0;
    }
  }, [job.status]);

  return (
    <Card ref={intersectionRef} className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            <CardTitle className="text-sm capitalize">{job.type.replace('_', ' ')}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {statusIcon}
              <span className="ml-1 capitalize">{job.status}</span>
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(job.created_at), 'MMM dd, HH:mm')}
          </span>
        </div>
        {job.metadata?.prompt && (
          <CardDescription className="text-xs truncate">
            {job.metadata.prompt}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
          
          {job.error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {job.error}
            </div>
          )}

          <div className="flex gap-2">
            {job.status === 'completed' || job.status === 'succeeded' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onJobAction?.(job.id, 'view')}
                  className="text-xs"
                >
                  <Play className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onJobAction?.(job.id, 'download')}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </>
            ) : job.status === 'failed' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onJobAction?.(job.id, 'retry')}
                className="text-xs"
              >
                Retry
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onJobAction?.(job.id, 'cancel')}
                className="text-xs"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

JobItem.displayName = 'JobItem';

const OptimizedJobsList = memo(({ jobs, onJobAction, isLoading }: OptimizedJobsListProps) => {
  const sortedJobs = useMemo(() => 
    [...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [jobs]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sortedJobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No jobs yet</h3>
          <p className="text-muted-foreground text-center">
            Start using our AI services to see your job history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedJobs.map((job) => (
        <JobItem
          key={job.id}
          job={job}
          onJobAction={onJobAction}
        />
      ))}
    </div>
  );
});

OptimizedJobsList.displayName = 'OptimizedJobsList';

export default OptimizedJobsList;
