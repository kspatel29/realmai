
import DashboardStatsCards from "@/components/DashboardStatsCards";
import DashboardServiceTutorials from "@/components/DashboardServiceTutorials";
import DashboardCreditsCard from "@/components/DashboardCreditsCard";
import JobProgressTracker from "@/components/JobProgressTracker";
import { FeatureToggle } from "@/components/FeatureToggle";
import AdvancedAnalyticsDashboard from "@/components/AdvancedAnalyticsDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Play, FileText, Zap } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your account and quick access to our AI services.
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards />

      {/* Job Progress and Credits */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <JobProgressTracker />
        </div>
        <div>
          <DashboardCreditsCard />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dashboard/video-dubbing')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600" />
              Video Dubbing
            </CardTitle>
            <CardDescription>
              Create multilingual versions of your videos with AI voice cloning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Start Dubbing
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dashboard/subtitles')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Subtitles
            </CardTitle>
            <CardDescription>
              Generate accurate subtitles for your videos automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Generate Subtitles
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dashboard/clips')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Video Clips
            </CardTitle>
            <CardDescription>
              Create short video clips from text prompts using AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Generate Clips
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Preview */}
      <FeatureToggle feature="advancedAnalytics">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analytics Preview
                </CardTitle>
                <CardDescription>
                  Quick insights into your service usage
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/dashboard/analytics')}>
                View Full Analytics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Analytics preview will be displayed here
            </div>
          </CardContent>
        </Card>
      </FeatureToggle>

      {/* Service Tutorials */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Learn How to Use Our Services</h2>
        <DashboardServiceTutorials />
      </div>
    </div>
  );
};

export default Dashboard;
