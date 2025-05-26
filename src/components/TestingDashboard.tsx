
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEndToEndTesting } from "@/hooks/useEndToEndTesting";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  TestTube,
  Activity
} from "lucide-react";

const TestingDashboard = () => {
  const { 
    testSuites, 
    isRunning, 
    runAllTests,
    runAuthenticationTests,
    runPaymentTests,
    runServiceTests
  } = useEndToEndTesting();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-500">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-500">Running</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const calculateProgress = () => {
    if (!testSuites.length) return 0;
    
    const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
    const completedTests = testSuites.reduce((sum, suite) => 
      sum + suite.tests.filter(test => test.status === 'passed' || test.status === 'failed').length, 0
    );
    
    return totalTests > 0 ? (completedTests / totalTests) * 100 : 0;
  };

  const getOverallStats = () => {
    const allTests = testSuites.flatMap(suite => suite.tests);
    return {
      total: allTests.length,
      passed: allTests.filter(test => test.status === 'passed').length,
      failed: allTests.filter(test => test.status === 'failed').length,
      running: allTests.filter(test => test.status === 'running').length
    };
  };

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">End-to-End Testing Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive testing suite for all application features
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      {testSuites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Test Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{stats.passed}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">{stats.running}</div>
                <div className="text-xs text-muted-foreground">Running</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Suites */}
      <div className="grid gap-6">
        {testSuites.map((suite) => (
          <Card key={suite.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    {suite.name}
                  </CardTitle>
                  <CardDescription>
                    {suite.tests.length} tests • 
                    {suite.status === 'completed' && suite.startTime && suite.endTime && (
                      <span> Completed in {suite.endTime - suite.startTime}ms</span>
                    )}
                  </CardDescription>
                </div>
                {getStatusBadge(suite.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suite.tests.map((test) => (
                  <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        {test.duration && (
                          <div className="text-xs text-muted-foreground">
                            Duration: {test.duration}ms
                          </div>
                        )}
                        {test.error && (
                          <div className="text-xs text-red-500 mt-1">
                            Error: {test.error}
                          </div>
                        )}
                        {test.details && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(test.details, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Individual Test Runners */}
      {!isRunning && testSuites.length === 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Tests</CardTitle>
              <CardDescription>Test user registration, login, and session management</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runAuthenticationTests} 
                variant="outline" 
                className="w-full"
              >
                Run Auth Tests
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Tests</CardTitle>
              <CardDescription>Test Stripe integration and credit management</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runPaymentTests} 
                variant="outline" 
                className="w-full"
              >
                Run Payment Tests
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Tests</CardTitle>
              <CardDescription>Test AI services and integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runServiceTests} 
                variant="outline" 
                className="w-full"
              >
                Run Service Tests
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TestingDashboard;
