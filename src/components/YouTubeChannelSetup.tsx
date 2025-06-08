
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Youtube, Loader2, Search, TrendingUp } from "lucide-react";
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

    if (channelName.trim().length < 3) {
      toast.error("Channel name must be at least 3 characters long");
      return;
    }
    
    console.log('Searching for channel:', channelName);
    onSearch(channelName.trim());
  };

  const handleExampleSearch = (exampleChannel: string) => {
    setChannelName(exampleChannel);
    onSearch(exampleChannel);
  };

  const popularChannels = [
    "MrBeast",
    "PewDiePie", 
    "Marques Brownlee",
    "Linus Tech Tips",
    "Veritasium"
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-600" />
          YouTube Analytics Setup
        </CardTitle>
        <CardDescription>
          Search for any YouTube channel to view comprehensive analytics and performance metrics
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="channel-name">YouTube Channel Name</Label>
            <Input 
              id="channel-name" 
              placeholder="Enter a YouTube channel name (e.g., MrBeast, PewDiePie)" 
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              required
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Search for any public YouTube channel to analyze their content performance
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Try Popular Channels
            </Label>
            <div className="flex flex-wrap gap-2">
              {popularChannels.map((channel) => (
                <Button
                  key={channel}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleSearch(channel)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {channel}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!channelName.trim() || channelName.trim().length < 3 || isLoading}
            className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching Channel...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Channel
              </div>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default YouTubeChannelSetup;
