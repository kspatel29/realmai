
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Youtube, Loader2 } from "lucide-react";
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
  const debouncedQuery = useDebounce(query, 600);
  
  const fetchChannelSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    try {
      const channelItems = await searchYouTubeChannels(searchQuery);
      
      const mappedChannels: Channel[] = channelItems.map(channel => ({
        id: channel.id,
        title: channel.snippet.title,
        thumbnail: channel.snippet.thumbnails.medium.url || channel.snippet.thumbnails.default.url,
        subscribers: parseInt(channel.statistics.subscriberCount).toLocaleString(),
        views: parseInt(channel.statistics.viewCount).toLocaleString(),
        videoCount: parseInt(channel.statistics.videoCount).toLocaleString(),
        description: channel.snippet.description,
        publishedAt: new Date(channel.snippet.publishedAt).toLocaleDateString()
      }));
      
      setSuggestions(mappedChannels);
      setShowSuggestions(mappedChannels.length > 0);
      
      if (mappedChannels.length === 0) {
        toast.info("No channels found matching your search.");
      }
      
    } catch (error) {
      console.error("Failed to fetch channel suggestions:", error);
      toast.error("Failed to load YouTube channels. Please try again.");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (debouncedQuery.length > 2) {
      fetchChannelSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);
  
  const handleInputFocus = () => {
    if (query.length > 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length > 2) {
      fetchChannelSuggestions(query);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-youtube-red" />
          Search YouTube Channels
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Input
              placeholder="Enter a YouTube channel name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              className="pr-10"
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost" 
              className="absolute right-0 top-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-youtube-red" />
            </div>
          )}
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
              <ul className="py-1">
                {suggestions.map((channel) => (
                  <li 
                    key={channel.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      onChannelSelect(channel);
                      setShowSuggestions(false);
                      setQuery("");
                    }}
                  >
                    <img 
                      src={channel.thumbnail} 
                      alt={channel.title}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{channel.title}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{channel.subscribers} subscribers</span>
                        {channel.videoCount && <span>• {channel.videoCount} videos</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default YouTubeChannelSearch;
