
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Youtube } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface Channel {
  id: string;
  title: string;
  thumbnail: string;
  subscribers: string;
}

interface YouTubeChannelSearchProps {
  onChannelSelect: (channel: Channel) => void;
}

const YouTubeChannelSearch = ({ onChannelSelect }: YouTubeChannelSearchProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Channel[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  
  // Mock fetch function to simulate API call
  const fetchChannelSuggestions = async (searchQuery: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data for suggestions - in a real app this would come from YouTube API
    const mockChannels: Channel[] = [
      {
        id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
        title: `${searchQuery} Official`,
        thumbnail: "https://yt3.googleusercontent.com/ytc/APkrFKbpSojje_-tkBQecNtFuPdSCrg3ZT0FhaYjln9k0g=s176-c-k-c0x00ffffff-no-rj",
        subscribers: "2.3M"
      },
      {
        id: "UCsBjURrPoezykLs9EqgamOA",
        title: `${searchQuery} Tech`,
        thumbnail: "https://yt3.googleusercontent.com/ytc/APkrFKZWeMCsx4Q9e_Hm6nhOOUQ3fv96QGUXiMr1-pPP=s176-c-k-c0x00ffffff-no-rj",
        subscribers: "1.8M"
      },
      {
        id: "UCbRP3c757lWg9M-U7TyEkXA",
        title: `${searchQuery} Academy`,
        thumbnail: "https://yt3.googleusercontent.com/ytc/APkrFKaqTKiYIV8Ya8l6u9YUMj8r8Ely0ihLZGZkCbJq=s176-c-k-c0x00ffffff-no-rj",
        subscribers: "975K"
      }
    ];
    
    setSuggestions(mockChannels);
    setIsLoading(false);
    setShowSuggestions(true);
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
    if (query.length > 2) {
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
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
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
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{channel.title}</p>
                      <p className="text-xs text-muted-foreground">{channel.subscribers} subscribers</p>
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
