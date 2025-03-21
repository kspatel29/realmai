
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, RefreshCw, Globe, ThumbsUp, MessageSquare, Clock } from "lucide-react";
import YouTubeChannelSetup from "@/components/YouTubeChannelSetup";

const Analytics = () => {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const { 
    videos, 
    totalStats, 
    isLoading, 
    syncYouTubeAnalytics, 
    channelInfo, 
    isLoadingChannel 
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

  // Channel is not set up yet, show setup form
  if (!isLoadingChannel && !channelInfo) {
    return (
      <div className={`space-y-8 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Track your content performance and audience growth.
          </p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="max-w-md w-full">
            <YouTubeChannelSetup channelInfo={channelInfo} />
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
            Track your content performance and audience growth.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {channelInfo && (
            <Button 
              variant="outline" 
              onClick={() => setChannelInfo(null)}
              className="gap-2"
            >
              Update Channel
            </Button>
          )}
          <Button 
            onClick={handleRefreshAnalytics} 
            disabled={syncYouTubeAnalytics.isPending}
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${syncYouTubeAnalytics.isPending ? 'animate-spin' : ''}`} />
            Refresh Analytics
          </Button>
        </div>
      </div>

      {channelInfo && (
        <div className="bg-muted/50 border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium">Connected YouTube Channel</h3>
            <p className="text-sm text-muted-foreground">{channelInfo.channel_name}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => window.open(`https://www.youtube.com/channel/${channelInfo.channel_id || ''}`, '_blank')}
          >
            Visit Channel
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
      )}

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
                <div className="text-2xl font-bold">{formatNumber(totalStats?.views || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all videos</p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <ThumbsUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totalStats?.likes || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Engagement rate: {totalStats ? ((totalStats.likes / totalStats.views) * 100).toFixed(1) + '%' : '0%'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in" style={{ animationDelay: "300ms" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Comments</CardTitle>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totalStats?.comments || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Community engagement</p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats?.watchTimeHours || 0} hours</div>
                <p className="text-xs text-muted-foreground mt-1">Avg: {totalStats && videos ? Math.round((totalStats.watchTimeHours / videos.length) / 3600) : 0} hours per video</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Video Performance Chart */}
            <Card className="md:col-span-2 animate-fade-in" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle>Video Performance</CardTitle>
                <CardDescription>Views and engagement metrics by video</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={videos?.map(video => ({
                        name: video.title.length > 20 ? `${video.title.substring(0, 20)}...` : video.title,
                        views: video.views,
                        likes: video.likes,
                        comments: video.comments
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#8884d8" name="Views" />
                      <Bar dataKey="likes" fill="#82ca9d" name="Likes" />
                      <Bar dataKey="comments" fill="#ffc658" name="Comments" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Audience Geography */}
            <Card className="animate-fade-in" style={{ animationDelay: "600ms" }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Audience Geography</CardTitle>
                  <CardDescription>Views by country</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
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

            {/* Video Details Table */}
            <Card className="animate-fade-in" style={{ animationDelay: "700ms" }}>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
                <CardDescription>Performance metrics by video</CardDescription>
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
