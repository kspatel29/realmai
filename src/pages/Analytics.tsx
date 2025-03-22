
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ArrowUpRight, RefreshCw, Globe, ThumbsUp, MessageSquare, Clock, TrendingUp, Calendar } from "lucide-react";
import YouTubeChannelSearch from "@/components/YouTubeChannelSearch";
import { getChannelDetails, getChannelGrowthStats } from "@/services/youtubeApi";
import { toast } from "sonner";

interface Channel {
  id: string;
  title: string;
  thumbnail: string;
  subscribers: string;
  views?: string;
  videoCount?: string;
  description?: string;
  publishedAt?: string;
}

interface GrowthStats {
  subscribers: {
    monthly: number;
    weekly: number;
    daily: number;
  };
  views: {
    monthly: number;
    weekly: number;
    daily: number;
  };
  engagement: string;
  growthRate: string;
}

const Analytics = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [growthStats, setGrowthStats] = useState<GrowthStats | null>(null);
  const { 
    videos, 
    totalStats, 
    syncYouTubeAnalytics
  } = useYouTubeAnalytics();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // When a channel is selected, fetch its growth stats
  useEffect(() => {
    if (selectedChannel) {
      fetchChannelGrowthStats(selectedChannel.id);
    }
  }, [selectedChannel]);

  const countryData = [
    { name: "United States", views: 42 },
    { name: "India", views: 15 },
    { name: "UK", views: 12 },
    { name: "Canada", views: 8 },
    { name: "Germany", views: 7 },
    { name: "Others", views: 16 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B'];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleRefreshAnalytics = () => {
    syncYouTubeAnalytics.mutate();
  };

  const fetchChannelAnalytics = async (channelId: string) => {
    setIsLoading(true);
    try {
      const channelData = await getChannelDetails(channelId);
      if (channelData && channelData.length > 0) {
        const channel = channelData[0];
        setSelectedChannel({
          id: channel.id,
          title: channel.snippet.title,
          thumbnail: channel.snippet.thumbnails.medium.url || channel.snippet.thumbnails.default.url,
          subscribers: parseInt(channel.statistics.subscriberCount).toLocaleString(),
          views: parseInt(channel.statistics.viewCount).toLocaleString(),
          videoCount: parseInt(channel.statistics.videoCount).toLocaleString(),
          description: channel.snippet.description,
          publishedAt: new Date(channel.snippet.publishedAt).toLocaleDateString()
        });
        
        // Also fetch growth stats
        fetchChannelGrowthStats(channelId);
        
        toast.success("Channel data refreshed successfully");
      } else {
        toast.error("No data found for this channel");
      }
    } catch (error) {
      console.error("Error fetching channel analytics:", error);
      toast.error("Failed to refresh channel data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChannelGrowthStats = async (channelId: string) => {
    try {
      const stats = await getChannelGrowthStats(channelId);
      if (stats) {
        setGrowthStats(stats);
      }
    } catch (error) {
      console.error("Error fetching growth stats:", error);
    }
  };

  // Generate growth trend data for the chart
  const generateGrowthTrendData = () => {
    if (!selectedChannel) return [];
    
    const currentSubs = parseInt(selectedChannel.subscribers.replace(/,/g, ''));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    // Generate mock historical data
    return months.map((month, index) => {
      const factor = 1 - (0.05 * (months.length - index - 1));
      return {
        name: month,
        subscribers: Math.floor(currentSubs * factor),
      };
    });
  };

  // Show channel search if no channel is selected
  if (!selectedChannel) {
    return (
      <div className={`space-y-8 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Search for a YouTube channel to view performance metrics.
          </p>
        </div>
        
        <div className="flex items-center justify-center py-6">
          <div className="max-w-md w-full">
            <YouTubeChannelSearch onChannelSelect={setSelectedChannel} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track channel performance and audience growth.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setSelectedChannel(null)}
            className="gap-2"
          >
            Change Channel
          </Button>
          <Button 
            onClick={() => fetchChannelAnalytics(selectedChannel.id)} 
            disabled={isLoading}
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Analytics
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img 
            src={selectedChannel.thumbnail} 
            alt={selectedChannel.title}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium">{selectedChannel.title}</h3>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>{selectedChannel.subscribers} subscribers</span>
              {selectedChannel.publishedAt && (
                <span>• Created {selectedChannel.publishedAt}</span>
              )}
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => window.open(`https://www.youtube.com/channel/${selectedChannel.id}`, '_blank')}
        >
          Visit Channel
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Globe className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedChannel.views || "N/A"}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all videos</p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                <ThumbsUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedChannel.subscribers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {growthStats && `+${formatNumber(growthStats.subscribers.monthly)} monthly`}
                </p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in" style={{ animationDelay: "300ms" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Videos</CardTitle>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedChannel.videoCount || "N/A"}</div>
                <p className="text-xs text-muted-foreground mt-1">Total published videos</p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {growthStats ? growthStats.growthRate : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Monthly subscriber growth</p>
              </CardContent>
            </Card>
          </div>

          {/* Growth Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="animate-fade-in" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>Last 6 months trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateGrowthTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatNumber(value)} />
                      <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Subscribers']} />
                      <Line 
                        type="monotone" 
                        dataKey="subscribers" 
                        stroke="#FF0000" 
                        strokeWidth={2}
                        dot={{ strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: "600ms" }}>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key growth indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {growthStats ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Subscriber Growth</h3>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">Daily</span>
                              <span className="text-xs font-medium">+{formatNumber(growthStats.subscribers.daily)}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">Weekly</span>
                              <span className="text-xs font-medium">+{formatNumber(growthStats.subscribers.weekly)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs">Monthly</span>
                              <span className="text-xs font-medium">+{formatNumber(growthStats.subscribers.monthly)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">View Growth</h3>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">Daily</span>
                              <span className="text-xs font-medium">+{formatNumber(growthStats.views.daily)}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">Weekly</span>
                              <span className="text-xs font-medium">+{formatNumber(growthStats.views.weekly)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs">Monthly</span>
                              <span className="text-xs font-medium">+{formatNumber(growthStats.views.monthly)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <h3 className="text-sm font-medium mb-2">Engagement Rate</h3>
                          <div className="text-2xl font-bold">{growthStats.engagement}</div>
                          <p className="text-xs text-muted-foreground mt-1">Avg. interaction per view</p>
                        </div>
                        
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <h3 className="text-sm font-medium mb-2">Views per Video</h3>
                          <div className="text-2xl font-bold">
                            {selectedChannel.views && selectedChannel.videoCount 
                              ? formatNumber(parseInt(selectedChannel.views.replace(/,/g, '')) / parseInt(selectedChannel.videoCount.replace(/,/g, '')))
                              : "N/A"}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Avg. performance</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">Loading performance metrics...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Channel Info */}
            <Card className="md:col-span-2 animate-fade-in" style={{ animationDelay: "700ms" }}>
              <CardHeader>
                <CardTitle>Channel Information</CardTitle>
                <CardDescription>Details from the YouTube API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Channel Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedChannel.description || "No description available"}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Channel Statistics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Views to Subscribers Ratio:</span>
                          <span className="text-sm font-medium">
                            {selectedChannel.subscribers && selectedChannel.views 
                              ? ((parseInt(selectedChannel.views.replace(/,/g, '')) / parseInt(selectedChannel.subscribers.replace(/,/g, ''))) * 100).toFixed(1) + '%'
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Videos per Subscriber:</span>
                          <span className="text-sm font-medium">
                            {selectedChannel.subscribers && selectedChannel.videoCount 
                              ? (parseInt(selectedChannel.videoCount.replace(/,/g, '')) / (parseInt(selectedChannel.subscribers.replace(/,/g, '')) / 1000)).toFixed(2) + ' per 1K'
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">View to Video Ratio:</span>
                          <span className="text-sm font-medium">
                            {selectedChannel.views && selectedChannel.videoCount 
                              ? formatNumber(parseInt(selectedChannel.views.replace(/,/g, '')) / parseInt(selectedChannel.videoCount.replace(/,/g, '')))
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audience Geography (sample data) */}
            <Card className="animate-fade-in" style={{ animationDelay: "800ms" }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Audience Geography</CardTitle>
                  <CardDescription>Sample distribution (not from API)</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={countryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="views"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {countryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Views']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sample Video Details Table */}
            <Card className="animate-fade-in" style={{ animationDelay: "900ms" }}>
              <CardHeader>
                <CardTitle>Sample Videos</CardTitle>
                <CardDescription>Example performance data (not from API)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Video</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Likes</TableHead>
                      <TableHead className="text-right">Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos?.map((video) => (
                      <TableRow key={video.video_id}>
                        <TableCell className="font-medium">
                          {video.title.length > 25 ? `${video.title.substring(0, 25)}...` : video.title}
                        </TableCell>
                        <TableCell className="text-right">{formatNumber(video.views)}</TableCell>
                        <TableCell className="text-right">{formatNumber(video.likes)}</TableCell>
                        <TableCell className="text-right">{formatNumber(video.comments)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
