
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useYouTubeAnalytics, YouTubeChannel } from "@/hooks/useYouTubeAnalytics";
import { YouTube } from "lucide-react";

interface YouTubeChannelSetupProps {
  channelInfo: YouTubeChannel | null;
  onSetupComplete?: () => void;
}

const YouTubeChannelSetup = ({ channelInfo, onSetupComplete }: YouTubeChannelSetupProps) => {
  const { saveChannel } = useYouTubeAnalytics();
  const [channelName, setChannelName] = useState(channelInfo?.channel_name || "");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelName.trim()) {
      return;
    }
    
    saveChannel.mutate({ channelName }, {
      onSuccess: () => {
        if (onSetupComplete) {
          onSetupComplete();
        }
      }
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <YouTube className="h-5 w-5 text-youtube-red" />
          {channelInfo ? "Update YouTube Channel" : "Connect YouTube Channel"}
        </CardTitle>
        <CardDescription>
          {channelInfo 
            ? "Update your YouTube channel information to sync your analytics" 
            : "Connect your YouTube channel to see analytics and performance metrics"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">YouTube Channel Name</Label>
            <Input 
              id="channel-name" 
              placeholder="Enter your YouTube channel name" 
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This helps us identify your channel and fetch analytics data
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!channelName.trim() || saveChannel.isPending}
            className="bg-youtube-red hover:bg-youtube-darkred"
          >
            {saveChannel.isPending 
              ? "Saving..." 
              : channelInfo 
                ? "Update Channel" 
                : "Connect Channel"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default YouTubeChannelSetup;
