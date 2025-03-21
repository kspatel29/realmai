
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, RefreshCw, Globe, ThumbsUp, MessageSquare, Clock } from "lucide-react";
import YouTubeChannelSearch from "@/components/YouTubeChannelSearch";
import { getChannelDetails } from "@/services/youtubeApi";
import { toast } from "sonner";

interface Channel {
  id: string;
  title: string;
  thumbnail: string;
  subscribers: string;
  views?: string;
  videoCount?: string;
  description?: string;
}

const Analytics = () => {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
        // Updated data was already set by the onChannelSelect handler
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
            <p className="text-sm text-muted-foreground">{selectedChannel.subscribers} subscribers</p>
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
                  Community engagement
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
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedChannel.subscribers && selectedChannel.views 
                    ? ((parseInt(selectedChannel.views.replace(/,/g, '')) / parseInt(selectedChannel.subscribers.replace(/,/g, ''))) * 100).toFixed(1) + '%'
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">View-to-subscriber ratio</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Videos */}
            <Card className="md:col-span-2 animate-fade-in" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle>YouTube Data</CardTitle>
                <CardDescription>These metrics are from the YouTube API</CardDescription>
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
                      <h3 className="font-medium mb-2">Performance Metrics</h3>
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
                          <span className="text-sm">Average Views Per Video:</span>
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
            <Card className="animate-fade-in" style={{ animationDelay: "600ms" }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Audience Geography</CardTitle>
                  <CardDescription>Sample data (not from API)</CardDescription>
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
            <Card className="animate-fade-in" style={{ animationDelay: "700ms" }}>
              <CardHeader>
                <CardTitle>Sample Videos</CardTitle>
                <CardDescription>Example data (not from API)</CardDescription>
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
