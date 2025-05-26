import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { Search, Users, Eye, ThumbsUp, MessageCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";

const Analytics = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [channelAnalytics, setChannelAnalytics] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const { searchChannels, getChannelAnalytics } = useYouTubeAnalytics();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a channel name to search");
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchChannels(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info("No channels found for your search");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for channels");
    } finally {
      setIsSearching(false);
    }
  };

  const handleChannelSelect = async (channel: any) => {
    setSelectedChannel(channel);
    
    try {
      const analytics = await getChannelAnalytics(channel.channel_id);
      setChannelAnalytics(analytics);
      toast.success(`Loaded analytics for ${channel.channel_name}`);
    } catch (error) {
      console.error("Analytics error:", error);
      toast.error("Failed to load channel analytics");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Prepare chart data for visualizations
  const engagementData = channelAnalytics ? {
    labels: ['Views', 'Likes', 'Comments'],
    datasets: [{
      label: 'Engagement Metrics',
      data: [channelAnalytics.views, channelAnalytics.likes, channelAnalytics.comments],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B']
    }]
  } : null;

  const performanceData = channelAnalytics ? {
    labels: ['Engagement Rate', 'CTR', 'Avg View Duration'],
    datasets: [{
      label: 'Performance %',
      data: [channelAnalytics.engagement, channelAnalytics.ctr, channelAnalytics.avgViewDuration],
      backgroundColor: ['#8B5CF6', '#EF4444', '#06B6D4']
    }]
  } : null;

  const growthTrendData = channelAnalytics ? {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Views Growth',
      data: [
        Math.floor(channelAnalytics.views * 0.7),
        Math.floor(channelAnalytics.views * 0.85),
        Math.floor(channelAnalytics.views * 0.95),
        channelAnalytics.views
      ],
      borderColor: '#3B82F6'
    }]
  } : null;

  const metricsDistributionData = channelAnalytics ? {
    labels: ['Views', 'Subscribers', 'Videos'],
    datasets: [{
      label: 'Channel Metrics',
      data: [
        channelAnalytics.views / 1000000,
        (selectedChannel?.subscriber_count || 0) / 1000000,
        (selectedChannel?.video_count || 0) / 10
      ],
      backgroundColor: ['#F472B6', '#34D399', '#FBBF24']
    }]
  } : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">YouTube Analytics</h1>
        <p className="text-muted-foreground">
          Search for any YouTube channel and analyze their performance metrics.
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Channel Search
          </CardTitle>
          <CardDescription>
            Enter a YouTube channel name to find and analyze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter channel name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-youtube-red hover:bg-youtube-darkred"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="grid gap-3 mt-4">
              <h4 className="font-medium">Search Results:</h4>
              {searchResults.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleChannelSelect(channel)}
                >
                  {channel.thumbnail && (
                    <img
                      src={channel.thumbnail}
                      alt={channel.channel_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium">{channel.channel_name}</h5>
                    <div className="text-sm text-muted-foreground flex gap-4">
                      <span>{formatNumber(channel.subscriber_count || 0)} subscribers</span>
                      <span>{formatNumber(channel.view_count || 0)} total views</span>
                      <span>{channel.video_count || 0} videos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Channel Analytics */}
      {selectedChannel && channelAnalytics && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                {selectedChannel.thumbnail && (
                  <img
                    src={selectedChannel.thumbnail}
                    alt={selectedChannel.channel_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <CardTitle>{selectedChannel.channel_name}</CardTitle>
                  <CardDescription>Channel Analytics Overview</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Analytics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(channelAnalytics.views)}</div>
                <p className="text-xs text-muted-foreground">
                  Across all videos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(selectedChannel.subscriber_count || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Total subscribers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channelAnalytics.engagement}%</div>
                <p className="text-xs text-muted-foreground">
                  Likes + comments / views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. View Duration</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channelAnalytics.avgViewDuration}m</div>
                <p className="text-xs text-muted-foreground">
                  Average watch time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(channelAnalytics.likes)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(channelAnalytics.comments)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CTR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channelAnalytics.ctr}%</div>
                <p className="text-xs text-muted-foreground">
                  Click-through rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {engagementData && (
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Views, likes, and comments breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart data={engagementData} className="h-[300px]" />
                </CardContent>
              </Card>
            )}

            {performanceData && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Engagement rate, CTR, and view duration</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart data={performanceData} className="h-[300px]" />
                </CardContent>
              </Card>
            )}

            {growthTrendData && (
              <Card>
                <CardHeader>
                  <CardTitle>Growth Trend</CardTitle>
                  <CardDescription>Views growth over the last 4 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart data={growthTrendData} className="h-[300px]" />
                </CardContent>
              </Card>
            )}

            {metricsDistributionData && (
              <Card>
                <CardHeader>
                  <CardTitle>Channel Metrics Distribution</CardTitle>
                  <CardDescription>Overall channel performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChart data={metricsDistributionData} className="h-[300px]" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {!selectedChannel && searchResults.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Search for YouTube Channels</h3>
              <p className="text-muted-foreground">
                Enter a channel name above to start analyzing YouTube performance metrics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
