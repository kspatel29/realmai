
interface YouTubeApiOptions {
  method: string;
  url: string;
  headers: {
    'X-RapidAPI-Key': string;
    'X-RapidAPI-Host': string;
  };
  params?: Record<string, string>;
}

export interface YouTubeChannelResponse {
  items: {
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
    statistics: {
      viewCount: string;
      subscriberCount: string;
      videoCount: string;
    };
  }[];
}

export interface YouTubeSearchResponse {
  items: {
    id: {
      kind: string;
      channelId: string;
    };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
      channelTitle: string;
    };
  }[];
}

const RAPID_API_KEY = "27449554c9mshaa154773226fe89p1f9cf9jsn064035a2f4e8";
const RAPID_API_HOST = "youtube-v31.p.rapidapi.com";

export const searchYouTubeChannels = async (query: string): Promise<YouTubeChannelResponse['items']> => {
  const options: YouTubeApiOptions = {
    method: 'GET',
    url: 'https://youtube-v31.p.rapidapi.com/search',
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': RAPID_API_HOST
    },
    params: {
      q: query,
      part: 'snippet',
      maxResults: '5',
      type: 'channel'
    }
  };

  try {
    const response = await fetch(`${options.url}?${new URLSearchParams(options.params)}`, {
      method: options.method,
      headers: options.headers
    });
    
    const data = await response.json() as YouTubeSearchResponse;
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    // Fetch detailed channel info for all search results
    const channelIds = data.items.map(item => item.id.channelId).join(',');
    return await getChannelDetails(channelIds);
    
  } catch (error) {
    console.error('Error searching YouTube channels:', error);
    throw error;
  }
};

export const getChannelDetails = async (channelId: string): Promise<YouTubeChannelResponse['items']> => {
  const options: YouTubeApiOptions = {
    method: 'GET',
    url: 'https://youtube-v31.p.rapidapi.com/channels',
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': RAPID_API_HOST
    },
    params: {
      part: 'snippet,statistics',
      id: channelId
    }
  };

  try {
    const response = await fetch(`${options.url}?${new URLSearchParams(options.params)}`, {
      method: options.method,
      headers: options.headers
    });
    
    const data = await response.json() as YouTubeChannelResponse;
    return data.items;
    
  } catch (error) {
    console.error('Error fetching channel details:', error);
    throw error;
  }
};
