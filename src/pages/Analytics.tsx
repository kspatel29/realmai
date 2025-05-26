
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { Search, TrendingUp, DollarSign, Users, Eye, ThumbsUp, MessageSquare, Clock, PlayCircle, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import AdvancedAnalyticsDashboard from "@/components/AdvancedAnalyticsDashboard";

interface RevenueData {
  date: string;
  credits_purchased: number;
  credits_used: number;
  revenue: number;
  profit_margin: number;
}

interface ServiceUsage {
  service: string;
  usage_count: number;
  revenue: number;
  avg_cost_per_use: number;
}

const Analytics = () => {
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [serviceUsage, setServiceUsage] = useState<ServiceUsage[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const { 
    searchChannels, 
    getChannelDetails, 
    getChannelAnalytics,
    isLoading, 
    channels,
    channelDetails,
    analytics 
  } = useYouTubeAnalytics();

  // Load revenue analytics
  useEffect(() => {
    loadRevenueAnalytics();
  }, []);

  const loadRevenueAnalytics = async () => {
    setLoading(true);
    try {
      // Get revenue data for the last 30 days
      const { data: transactions } = await supabase
        .from('credit_transactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (transactions) {
        // Process revenue data by day
        const revenueByDay = transactions.reduce((acc: Record<string, any>, transaction) => {
          const date = new Date(transaction.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = {
              date,
              credits_purchased: 0,
              credits_used: 0,
              revenue: 0,
              profit_margin: 0
            };
          }
          
          if (transaction.type === 'purchase') {
            acc[date].credits_purchased += transaction.amount;
            acc[date].revenue += (transaction.amount * 0.067); // Assuming $0.067 per credit
          } else if (transaction.type === 'usage') {
            acc[date].credits_used += Math.abs(transaction.amount);
          }
          
          return acc;
        }, {});

        const processedData = Object.values(revenueByDay).map((day: any) => ({
          ...day,
          profit_margin: day.revenue > 0 ? ((day.revenue - (day.credits_used * 0.03)) / day.revenue * 100) : 0
        }));

        setRevenueData(processedData);
        setTotalRevenue(processedData.reduce((sum, day) => sum + day.revenue, 0));
        setTotalProfit(processedData.reduce((sum, day) => sum + (day.revenue * day.profit_margin / 100), 0));
      }

      // Get service usage statistics
      const { data: serviceStats } = await supabase
        .from('service_usage_logs')
        .select('service_type, credits_used, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (serviceStats) {
        const serviceUsageMap = serviceStats.reduce((acc: Record<string, any>, log) => {
          const service = log.service_type;
          if (!acc[service]) {
            acc[service] = {
              service,
              usage_count: 0,
              revenue: 0,
              avg_cost_per_use: 0
            };
          }
          acc[service].usage_count += 1;
          acc[service].revenue += log.credits_used * 0.067;
          return acc;
        }, {});

        const processedServiceData = Object.values(serviceUsageMap).map((service: any) => ({
          ...service,
          avg_cost_per_use: service.usage_count > 0 ? service.revenue / service.usage_count : 0
        }));

        setServiceUsage(processedServiceData);
      }

      // Get active users count
      const { data: users } = await supabase
        .from('profiles')
        .select('user_id')
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      setActiveUsers(users?.length || 0);

    } catch (error) {
      console.error('Error loading revenue analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchChannels(searchQuery);
    }
  };

  const handleChannelSelect = async (channel: any) => {
    setSelectedChannel(channel);
    await getChannelDetails(channel.id);
    await getChannelAnalytics(channel.id);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#00ff88', '#ff00ff'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics for YouTube channels and revenue insights.
        </p>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Analytics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="mt-6">
          <div className="space-y-6">
            {/* Revenue Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalProfit.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% margin
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Revenue/User</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${activeUsers > 0 ? (totalRevenue / activeUsers).toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">Per active user</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue and profit margin over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? `$${Number(value).toFixed(2)}` : `${Number(value).toFixed(1)}%`,
                      name === 'revenue' ? 'Revenue' : 'Profit Margin'
                    ]} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="profit_margin" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service Usage Analytics */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Service Usage Distribution</CardTitle>
                  <CardDescription>Revenue by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ service, revenue }) => `${service}: $${revenue.toFixed(2)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {serviceUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Performance</CardTitle>
                  <CardDescription>Usage count vs average cost per use</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        name === 'usage_count' ? value : `$${Number(value).toFixed(2)}`,
                        name === 'usage_count' ? 'Usage Count' : 'Avg Cost/Use'
                      ]} />
                      <Bar dataKey="usage_count" fill="#8884d8" />
                      <Bar dataKey="avg_cost_per_use" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="youtube" className="mt-6">
          <div className="space-y-6">
            {/* Channel Search */}
            <Card>
              <CardHeader>
                <CardTitle>YouTube Channel Search</CardTitle>
                <CardDescription>Search for any YouTube channel to view analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter channel name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isLoading}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {channels.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {channels.map((channel) => (
                      <Card 
                        key={channel.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleChannelSelect(channel)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {channel.thumbnail && (
                              <img 
                                src={channel.thumbnail} 
                                alt={channel.title}
                                className="w-12 h-12 rounded-full"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-medium truncate">{channel.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {channel.description || 'No description'}
                              </p>
                              {channel.subscriberCount && (
                                <Badge variant="secondary" className="mt-1">
                                  {Number(channel.subscriberCount).toLocaleString()} subscribers
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Channel Details */}
            {selectedChannel && channelDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Channel Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Subscribers</p>
                        <p className="font-medium">{Number(channelDetails.subscriberCount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Videos</p>
                        <p className="font-medium">{Number(channelDetails.videoCount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="font-medium">{Number(channelDetails.viewCount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">
                          {channelDetails.publishedAt ? new Date(channelDetails.publishedAt).getFullYear() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Data */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Channel Analytics</CardTitle>
                  <CardDescription>Performance metrics and engagement data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{Number(analytics.views || 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{Number(analytics.likes || 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Likes</p>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{Number(analytics.comments || 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Comments</p>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">
                        {analytics.likes && analytics.views ? 
                          ((Number(analytics.likes) / Number(analytics.views)) * 100).toFixed(2) : '0'
                        }%
                      </p>
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <AdvancedAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
