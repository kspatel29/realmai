
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Youtube, Loader2 } from "lucide-react";
import { searchYouTubeChannels } from "@/services/youtubeApi";
import { toast } from "sonner";

interface YouTubeChannelSetupProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const YouTubeChannelSetup = ({ onSearch, isLoading }: YouTubeChannelSetupProps) => {
  const [channelName, setChannelName] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelName.trim()) {
      toast.error("Please enter a YouTube channel name");
      return;
    }
    
    onSearch(channelName);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-youtube-red" />
          Search YouTube Channel
        </CardTitle>
        <CardDescription>
          Search for a YouTube channel to view its analytics and performance metrics
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">YouTube Channel Name</Label>
            <Input 
              id="channel-name" 
              placeholder="Enter a YouTube channel name" 
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Search for any YouTube channel to view their analytics data
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!channelName.trim() || isLoading}
            className="bg-youtube-red hover:bg-youtube-darkred w-full md:w-auto"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            ) : (
              "Search Channel"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default YouTubeChannelSetup;
