
import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useIntersectionObserver } from "@/hooks/usePerformanceOptimization";
import { Clock, PlayCircle, FileText, Zap, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface Job {
  id: string;
  service: string;
  status: string;
  created_at: string;
  updated_at?: string;
  progress?: number;
  error?: string;
}

interface OptimizedJobsListProps {
  jobs: Job[];
  isLoading: boolean;
  onJobClick?: (job: Job) => void;
}

const OptimizedJobsList = ({ jobs, isLoading, onJobClick }: OptimizedJobsListProps) => {
  const targetRef = useIntersectionObserver((isVisible) => {
    // Handle intersection if needed
  });

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [jobs]);

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'dubbing':
        return <PlayCircle className="h-4 w-4" />;
      case 'subtitles':
        return <FileText className="h-4 w-4" />;
      case 'video_generation':
        return <Zap className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" ref={targetRef as React.RefObject<HTMLDivElement>}>
      {sortedJobs.map((job) => (
        <Card 
          key={job.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onJobClick?.(job)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getServiceIcon(job.service)}
                {job.service.charAt(0).toUpperCase() + job.service.slice(1)}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(job.status)}
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </div>
            <CardDescription className="text-xs">
              Started {new Date(job.created_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {job.progress !== undefined && (
              <div className="mb-2">
                <Progress value={job.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {job.progress}% complete
                </p>
              </div>
            )}
            {job.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded text-xs">
                {job.error}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {sortedJobs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No jobs found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimizedJobsList;
