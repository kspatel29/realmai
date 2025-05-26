
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Users, Eye, Calendar, Video } from "lucide-react";
import YouTubeChannelSearch from "@/components/YouTubeChannelSearch";
import { supabase } from "@/integrations/supabase/client";
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

const Analytics = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChannelSelect = async (channel: Channel) => {
    setSelectedChannel(channel);
    setIsLoading(true);
    
    try {
      // Fetch additional channel details using the youtube-api edge function
      const { data, error } = await supabase.functions.invoke('youtube-api', {
        body: {
          operation: 'get_channel_details',
          channelId: channel.id
        }
      });

      if (error) {
        console.error('Error fetching channel details:', error);
        toast.error('Failed to load detailed channel analytics');
      } else if (data?.items?.[0]) {
        const channelDetails = data.items[0];
        setSelectedChannel({
          ...channel,
          subscribers: parseInt(channelDetails.statistics.subscriberCount).toLocaleString(),
          views: parseInt(channelDetails.statistics.viewCount).toLocaleString(),
          videoCount: parseInt(channelDetails.statistics.videoCount).toLocaleString(),
          description: channelDetails.snippet.description?.substring(0, 300) + '...',
          publishedAt: new Date(channelDetails.snippet.publishedAt).toLocaleDateString()
        });
        toast.success(`Loaded analytics for ${channel.title}`);
      }
    } catch (error) {
      console.error('Error in channel analytics:', error);
      toast.error('Failed to load channel analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const getEngagementRate = () => {
    if (!selectedChannel?.subscribers || !selectedChannel?.views) return "N/A";
    const subs = parseInt(selectedChannel.subscribers.replace(/,/g, ''));
    const views = parseInt(selectedChannel.views.replace(/,/g, ''));
    const rate = ((views / subs) * 100).toFixed(1);
    return `${rate}%`;
  };

  const getAverageViewsPerVideo = () => {
    if (!selectedChannel?.views || !selectedChannel?.videoCount) return "N/A";
    const views = parseInt(selectedChannel.views.replace(/,/g, ''));
    const videos = parseInt(selectedChannel.videoCount.replace(/,/g, ''));
    return Math.round(views / videos).toLocaleString();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">YouTube Analytics</h1>
        <p className="text-muted-foreground">
          Search and analyze any YouTube channel's performance metrics and statistics.
        </p>
      </div>

      <YouTubeChannelSearch onChannelSelect={handleChannelSelect} />

      {selectedChannel && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <img 
                  src={selectedChannel.thumbnail} 
                  alt={selectedChannel.title}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <CardTitle className="text-xl">{selectedChannel.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {selectedChannel.description || "No description available"}
                  </CardDescription>
                  {selectedChannel.publishedAt && (
                    <Badge variant="secondary" className="mt-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      Since {selectedChannel.publishedAt}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subscribers</p>
                    <p className="text-2xl font-bold">{selectedChannel.subscribers}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{selectedChannel.views || "N/A"}</p>
                  </div>
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Videos</p>
                    <p className="text-2xl font-bold">{selectedChannel.videoCount || "N/A"}</p>
                  </div>
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Views/Video</p>
                    <p className="text-2xl font-bold">{getAverageViewsPerVideo()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Channel Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Engagement Rate</span>
                <Badge variant="outline">{getEngagementRate()}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Content Consistency</span>
                <Badge variant="outline">
                  {selectedChannel.videoCount ? `${Math.round(parseInt(selectedChannel.videoCount.replace(/,/g, '')) / 365)} videos/year` : "N/A"}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Channel Age</span>
                <Badge variant="outline">
                  {selectedChannel.publishedAt ? `${Math.round((Date.now() - new Date(selectedChannel.publishedAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years` : "N/A"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading detailed analytics...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
