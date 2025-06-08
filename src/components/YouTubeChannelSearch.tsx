
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Youtube, Loader2, ExternalLink } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchYouTubeChannels } from "@/services/youtubeApi";
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

interface YouTubeChannelSearchProps {
  onChannelSelect: (channel: Channel) => void;
}

const YouTubeChannelSearch = ({ onChannelSelect }: YouTubeChannelSearchProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Channel[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const debouncedQuery = useDebounce(query, 800);
  
  const fetchChannelSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) return;
    
    setIsLoading(true);
    
    try {
      console.log(`Searching for YouTube channels: ${searchQuery}`);
      const channelItems = await searchYouTubeChannels(searchQuery);
      
      const mappedChannels: Channel[] = channelItems.map(channel => ({
        id: channel.id,
        title: channel.snippet.title,
        thumbnail: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default.url,
        subscribers: parseInt(channel.statistics.subscriberCount).toLocaleString(),
        views: parseInt(channel.statistics.viewCount).toLocaleString(),
        videoCount: parseInt(channel.statistics.videoCount).toLocaleString(),
        description: channel.snippet.description?.substring(0, 150) + '...',
        publishedAt: new Date(channel.snippet.publishedAt).toLocaleDateString()
      }));
      
      setSuggestions(mappedChannels);
      setShowSuggestions(mappedChannels.length > 0);
      
      if (mappedChannels.length === 0) {
        toast.info("No channels found. Try a different search term.");
      } else {
        toast.success(`Found ${mappedChannels.length} channel${mappedChannels.length > 1 ? 's' : ''}`);
      }
      
    } catch (error) {
      console.error("Failed to fetch channel suggestions:", error);
      toast.error("Failed to load YouTube channels. Please try again.");
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      fetchChannelSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);
  
  const handleInputFocus = () => {
    if (query.length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => setShowSuggestions(false), 200);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length >= 3) {
      fetchChannelSuggestions(query);
    } else {
      toast.error("Please enter at least 3 characters to search");
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    onChannelSelect(channel);
    setShowSuggestions(false);
    setQuery(channel.title);
    toast.success(`Selected: ${channel.title}`);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-600" />
          Search YouTube Channels
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Input
              placeholder="Enter a YouTube channel name (min. 3 characters)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="pr-10"
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost" 
              className="absolute right-0 top-0"
              disabled={isLoading || query.length < 3}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-80 overflow-y-auto">
              <ul className="py-1">
                {suggestions.map((channel) => (
                  <li 
                    key={channel.id}
                    className="flex items-center gap-3 px-3 py-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                    onClick={() => handleChannelSelect(channel)}
                  >
                    <img 
                      src={channel.thumbnail} 
                      alt={channel.title}
                      className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{channel.title}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span>{channel.subscribers} subscribers</span>
                        {channel.videoCount && <span>• {channel.videoCount} videos</span>}
                        {channel.views && <span>• {channel.views} views</span>}
                      </div>
                      {channel.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {channel.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        {selectedChannel && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedChannel.thumbnail} 
                  alt={selectedChannel.title}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedChannel.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>{selectedChannel.subscribers} subscribers</span>
                    <span>{selectedChannel.videoCount} videos</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Channel since: {selectedChannel.publishedAt}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Searching YouTube channels...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubeChannelSearch;
