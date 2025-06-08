
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestingDashboard from "@/components/TestingDashboard";
import ProductionMonitoringDashboard from "@/components/ProductionMonitoringDashboard";
import JobProgressTracker from "@/components/JobProgressTracker";
import { FeatureToggle } from "@/components/FeatureToggle";
import { TestTube, Activity, BarChart3 } from "lucide-react";

const Testing = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Testing & Monitoring</h1>
        <p className="text-muted-foreground">
          Comprehensive testing suite and production monitoring dashboard for ensuring system reliability.
        </p>
      </div>

      <Tabs defaultValue="testing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            End-to-End Testing
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Production Monitoring
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Job Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testing">
          <TestingDashboard />
        </TabsContent>

        <TabsContent value="monitoring">
          <FeatureToggle feature="advancedAnalytics">
            <ProductionMonitoringDashboard />
          </FeatureToggle>
        </TabsContent>

        <TabsContent value="jobs">
          <JobProgressTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Testing;
