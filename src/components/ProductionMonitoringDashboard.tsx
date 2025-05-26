
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProductionMonitoring } from "@/hooks/useProductionMonitoring";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MemoryStick,
  Zap,
  RefreshCw
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProductionMonitoringDashboard = () => {
  const { 
    metrics, 
    systemHealth, 
    errorLogs, 
    checkSystemHealth,
    getMonitoringSummary
  } = useProductionMonitoring();

  const summary = getMonitoringSummary();

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500">Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const apiResponseData = Object.entries(metrics.apiResponseTimes).map(([endpoint, time]) => ({
    endpoint: endpoint.split('/').pop() || endpoint,
    responseTime: time
  }));

  const recentErrorsData = errorLogs
    .filter(log => Date.now() - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000)
    .reduce((acc, log) => {
      const hour = new Date(log.timestamp).getHours();
      const key = `${hour}:00`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const errorChartData = Object.entries(recentErrorsData).map(([hour, count]) => ({
    hour,
    errors: count
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Production Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <Button 
          onClick={checkSystemHealth}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Health Check
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            {getHealthIcon(systemHealth.overall)}
          </CardHeader>
          <CardContent>
            {getHealthBadge(systemHealth.overall)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            {getHealthIcon(systemHealth.database)}
          </CardHeader>
          <CardContent>
            {getHealthBadge(systemHealth.database)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
            {getHealthIcon(systemHealth.authentication)}
          </CardHeader>
          <CardContent>
            {getHealthBadge(systemHealth.authentication)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments</CardTitle>
            {getHealthIcon(systemHealth.payments)}
          </CardHeader>
          <CardContent>
            {getHealthBadge(systemHealth.payments)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Services</CardTitle>
            {getHealthIcon(systemHealth.aiServices)}
          </CardHeader>
          <CardContent>
            {getHealthBadge(systemHealth.aiServices)}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pageLoadTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Initial page load performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg API Response</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgApiResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average API call duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.memoryUsage}MB</div>
            <p className="text-xs text-muted-foreground">
              Current memory consumption
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(summary.sessionDuration / 60)}m</div>
            <p className="text-xs text-muted-foreground">
              Current session length
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Response Times</CardTitle>
            <CardDescription>Response times by endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apiResponseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}ms`, 'Response Time']} />
                <Bar dataKey="responseTime" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate (24h)</CardTitle>
            <CardDescription>Errors by hour in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={errorChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}`, 'Errors']} />
                <Bar dataKey="errors" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Error Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Error Logs</CardTitle>
          <CardDescription>
            Latest errors and critical issues ({summary.recentErrors} in last 24h)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {errorLogs.slice(0, 10).map((error) => (
              <div key={error.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={error.severity === 'critical' ? 'destructive' : 'outline'}
                    >
                      {error.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="font-medium text-sm">{error.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {error.url}
                  </div>
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
            
            {errorLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No errors logged recently
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionMonitoringDashboard;
