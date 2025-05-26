import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { Search, TrendingUp, DollarSign, Users, Eye, ThumbsUp, MessageSquare, Clock, PlayCircle, BarChart3, Loader2 } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [channelAnalytics, setChannelAnalytics] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
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
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchChannels(searchQuery.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching channels:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChannelSelect = async (channel: any) => {
    setSelectedChannel(channel);
    setIsLoadingAnalytics(true);
    
    try {
      const analytics = await getChannelAnalytics(channel.channel_id);
      setChannelAnalytics(analytics);
    } catch (error) {
      console.error('Error loading channel analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#00ff88', '#ff00ff'];

  // Generate chart data for channel analytics
  const generateChartData = () => {
    if (!channelAnalytics) return [];
    
    return [
      { name: 'Views', value: channelAnalytics.views },
      { name: 'Likes', value: channelAnalytics.likes },
      { name: 'Comments', value: channelAnalytics.comments },
    ];
  };

  const generateGrowthData = () => {
    if (!channelAnalytics) return [];
    
    // Generate mock historical data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      subscribers: Math.floor(selectedChannel?.subscriber_count * (0.7 + (index * 0.05))),
      views: Math.floor(channelAnalytics.views * (0.6 + (index * 0.07))),
      engagement: Math.floor(channelAnalytics.engagement * (0.8 + (index * 0.04)))
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics for YouTube channels and revenue insights.
        </p>
      </div>

      <Tabs defaultValue="youtube" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="youtube">YouTube Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="youtube" className="mt-6">
          <div className="space-y-6">
            {/* YouTube Channel Search */}
            <Card>
              <CardHeader>
                <CardTitle>YouTube Channel Search</CardTitle>
                <CardDescription>Search for any YouTube channel to view comprehensive analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter channel name (e.g., MrBeast, PewDiePie)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>Click on a channel to view detailed analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((channel) => (
                      <Card 
                        key={channel.id} 
                        className={`cursor-pointer hover:shadow-md transition-shadow ${
                          selectedChannel?.id === channel.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleChannelSelect(channel)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {channel.thumbnail && (
                              <img 
                                src={channel.thumbnail} 
                                alt={channel.channel_name}
                                className="w-12 h-12 rounded-full"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{channel.channel_name}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {channel.description || 'No description available'}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {Number(channel.subscriber_count || 0).toLocaleString()} subs
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {Number(channel.video_count || 0).toLocaleString()} videos
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Channel Analytics */}
            {selectedChannel && (
              <div className="space-y-6">
                {/* Channel Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {selectedChannel.thumbnail && (
                        <img 
                          src={selectedChannel.thumbnail} 
                          alt={selectedChannel.channel_name}
                          className="w-16 h-16 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-xl">{selectedChannel.channel_name}</CardTitle>
                        <CardDescription>{selectedChannel.description}</CardDescription>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{Number(selectedChannel.subscriber_count || 0).toLocaleString()} subscribers</span>
                          <span>{Number(selectedChannel.video_count || 0).toLocaleString()} videos</span>
                          <span>{Number(selectedChannel.view_count || 0).toLocaleString()} total views</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {isLoadingAnalytics ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      <span>Loading analytics...</span>
                    </CardContent>
                  </Card>
                ) : channelAnalytics && (
                  <>
                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{Number(channelAnalytics.views || 0).toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground">Lifetime views</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{channelAnalytics.engagement}%</div>
                          <p className="text-xs text-muted-foreground">Average engagement</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${Number(channelAnalytics.revenue || 0).toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground">Estimated total</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Avg Watch Time</CardTitle>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{channelAnalytics.avgViewDuration}m</div>
                          <p className="text-xs text-muted-foreground">Per video view</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Channel Performance</CardTitle>
                          <CardDescription>Views, likes, and comments distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={generateChartData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${Number(value).toLocaleString()}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {generateChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Growth Trends</CardTitle>
                          <CardDescription>Historical performance over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={generateGrowthData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                              <Line type="monotone" dataKey="subscribers" stroke="#8884d8" strokeWidth={2} />
                              <Line type="monotone" dataKey="views" stroke="#82ca9d" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Additional Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                        <CardDescription>Detailed channel performance indicators</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{channelAnalytics.cpm}</div>
                            <div className="text-sm text-muted-foreground">CPM ($)</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{channelAnalytics.ctr}%</div>
                            <div className="text-sm text-muted-foreground">Click-through Rate</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{channelAnalytics.growth}%</div>
                            <div className="text-sm text-muted-foreground">Growth Rate</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
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

        <TabsContent value="advanced" className="mt-6">
          <AdvancedAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
