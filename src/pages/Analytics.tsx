
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvancedAnalyticsDashboard from "@/components/AdvancedAnalyticsDashboard";
import OptimizedJobsList from "@/components/OptimizedJobsList";
import { useUnifiedJobManager } from "@/hooks/useUnifiedJobManager";
import { BarChart3, TrendingUp, Activity } from "lucide-react";

const Analytics = () => {
  const { allJobs, isLoading } = useUnifiedJobManager();

  const handleJobClick = (job: any) => {
    console.log(`Job clicked: ${job.id}`);
    // Handle job click actions like view details, download, etc.
  };

  // Transform unified jobs to match OptimizedJobsList expected format
  const transformedJobs = allJobs.map(job => ({
    ...job,
    service: job.type || 'unknown', // Use 'type' property instead of 'service'
    created_at: job.created_at,
    updated_at: job.updated_at || job.created_at
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Analytics & History</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your AI service usage and job history.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Advanced Analytics
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Job History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allJobs.length}</div>
                <p className="text-xs text-muted-foreground">
                  All time job count
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allJobs.filter(job => 
                    job.status === 'completed' || job.status === 'succeeded'
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allJobs.length > 0 
                    ? Math.round((allJobs.filter(job => 
                        job.status === 'completed' || job.status === 'succeeded'
                      ).length / allJobs.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Job completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest AI service jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <OptimizedJobsList 
                  jobs={transformedJobs.slice(0, 10)} 
                  onJobClick={handleJobClick}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Complete Job History</CardTitle>
              <CardDescription>All your AI service jobs with detailed status</CardDescription>
            </CardHeader>
            <CardContent>
              <OptimizedJobsList 
                jobs={transformedJobs} 
                onJobClick={handleJobClick}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
