
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

// Mock data for when the API fails
const MOCK_CHANNELS = [
  {
    id: "UCX6OQ3DkcsbYNE6H8uQQuVA",
    snippet: {
      title: "MrBeast",
      description: "I make YouTube videos.",
      thumbnails: {
        default: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZTUVa5AeFd3m5-4fdY9Fj9Seb0cjw4Z9SJD0jXAqQ=s88-c-k-c0xffffffff-no-rj-mo" },
        medium: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZTUVa5AeFd3m5-4fdY9Fj9Seb0cjw4Z9SJD0jXAqQ=s240-c-k-c0xffffffff-no-rj-mo" },
        high: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZTUVa5AeFd3m5-4fdY9Fj9Seb0cjw4Z9SJD0jXAqQ=s800-c-k-c0xffffffff-no-rj-mo" }
      }
    },
    statistics: {
      viewCount: "32000000000",
      subscriberCount: "235000000",
      videoCount: "742"
    }
  },
  {
    id: "UC6nSFpj9HTCZ5t-N3Rm3-HA",
    snippet: {
      title: "Vsauce",
      description: "Our world is amazing. Welcome to Vsauce.",
      thumbnails: {
        default: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZR7VipUCwMmmeT_YZBXzUXiPkO0OOeHRAiXPg_e=s88-c-k-c0xffffffff-no-rj-mo" },
        medium: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZR7VipUCwMmmeT_YZBXzUXiPkO0OOeHRAiXPg_e=s240-c-k-c0xffffffff-no-rj-mo" },
        high: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZR7VipUCwMmmeT_YZBXzUXiPkO0OOeHRAiXPg_e=s800-c-k-c0xffffffff-no-rj-mo" }
      }
    },
    statistics: {
      viewCount: "2500000000",
      subscriberCount: "17800000",
      videoCount: "389"
    }
  },
  {
    id: "UCBJycsmduvYEL83R_U4JriQ",
    snippet: {
      title: "Marques Brownlee",
      description: "MKBHD: Quality Tech Videos.",
      thumbnails: {
        default: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZTmdjQEgEoQl_Y9F7xCGbuV03sRJhcxUEReRYIBCg=s88-c-k-c0xffffffff-no-rj-mo" },
        medium: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZTmdjQEgEoQl_Y9F7xCGbuV03sRJhcxUEReRYIBCg=s240-c-k-c0xffffffff-no-rj-mo" },
        high: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZTmdjQEgEoQl_Y9F7xCGbuV03sRJhcxUEReRYIBCg=s800-c-k-c0xffffffff-no-rj-mo" }
      }
    },
    statistics: {
      viewCount: "3100000000",
      subscriberCount: "18200000",
      videoCount: "1456"
    }
  },
  {
    id: "UCXuqSBlHAE6Xw-yeJA0Tunw",
    snippet: {
      title: "Linus Tech Tips",
      description: "Tech can be complicated; we try to make it easy.",
      thumbnails: {
        default: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZTcnR8M83Kh1Gf8KGPWcFBQCc4hyvsxZgNLYH0n=s88-c-k-c0xffffffff-no-rj-mo" },
        medium: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZTcnR8M83Kh1Gf8KGPWcFBQCc4hyvsxZgNLYH0n=s240-c-k-c0xffffffff-no-rj-mo" },
        high: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZTcnR8M83Kh1Gf8KGPWcFBQCc4hyvsxZgNLYH0n=s800-c-k-c0xffffffff-no-rj-mo" }
      }
    },
    statistics: {
      viewCount: "7800000000",
      subscriberCount: "15600000",
      videoCount: "5872"
    }
  },
  {
    id: "UCUpxnSzY9ylkSQxWp-reaOQ",
    snippet: {
      title: "Veritasium",
      description: "An element of truth - videos about science, education, and anything else that's fascinating.",
      thumbnails: {
        default: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZQ8IsSvRSazKu3aVeZC8MRZNBuAD13wVnwWY_Kpsw=s88-c-k-c0xffffffff-no-rj-mo" },
        medium: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZQ8IsSvRSazKu3aVeZC8MRZNBuAD13wVnwWY_Kpsw=s240-c-k-c0xffffffff-no-rj-mo" },
        high: { url: "https://yt3.googleusercontent.com/ytc/AIf8zZQ8IsSvRSazKu3aVeZC8MRZNBuAD13wVnwWY_Kpsw=s800-c-k-c0xffffffff-no-rj-mo" }
      }
    },
    statistics: {
      viewCount: "1900000000",
      subscriberCount: "14300000",
      videoCount: "223"
    }
  }
];

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
    console.log(`Searching for YouTube channels with query: ${query}`);
    const response = await fetch(`${options.url}?${new URLSearchParams(options.params)}`, {
      method: options.method,
      headers: options.headers
    });
    
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} ${response.statusText}`);
      // Return filtered mock data based on the search query
      return MOCK_CHANNELS.filter(channel => 
        channel.snippet.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    const data = await response.json() as YouTubeSearchResponse;
    
    if (!data.items || data.items.length === 0) {
      console.log("No channels found, returning mock data");
      return MOCK_CHANNELS.filter(channel => 
        channel.snippet.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Fetch detailed channel info for all search results
    const channelIds = data.items.map(item => item.id.channelId).join(',');
    return await getChannelDetails(channelIds);
    
  } catch (error) {
    console.error('Error searching YouTube channels:', error);
    // Return filtered mock data based on the search query
    return MOCK_CHANNELS.filter(channel => 
      channel.snippet.title.toLowerCase().includes(query.toLowerCase())
    );
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
    console.log(`Fetching channel details for: ${channelId}`);
    const response = await fetch(`${options.url}?${new URLSearchParams(options.params)}`, {
      method: options.method,
      headers: options.headers
    });
    
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} ${response.statusText}`);
      // Find the matching channel in mock data or return the first one
      const matchedChannel = MOCK_CHANNELS.find(channel => channel.id === channelId);
      return matchedChannel ? [matchedChannel] : [MOCK_CHANNELS[0]];
    }
    
    const data = await response.json() as YouTubeChannelResponse;
    if (!data.items || data.items.length === 0) {
      console.log("No channel details found, returning mock data");
      const matchedChannel = MOCK_CHANNELS.find(channel => channel.id === channelId);
      return matchedChannel ? [matchedChannel] : [MOCK_CHANNELS[0]];
    }
    
    return data.items;
    
  } catch (error) {
    console.error('Error fetching channel details:', error);
    // Find the matching channel in mock data or return the first one
    const matchedChannel = MOCK_CHANNELS.find(channel => channel.id === channelId);
    return matchedChannel ? [matchedChannel] : [MOCK_CHANNELS[0]];
  }
};
