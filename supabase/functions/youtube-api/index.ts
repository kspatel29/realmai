
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the API token from environment variables
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error("YOUTUBE_API_KEY is not set");
      throw new Error("API configuration error: YOUTUBE_API_KEY is not set");
    }

    // Parse the request body
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    let body;
    try {
      body = JSON.parse(requestBody);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(JSON.stringify({ error: `Invalid JSON in request: ${parseError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Parsed request body:", JSON.stringify(body));

    // Handle different API operations
    if (body.operation === "search_channels") {
      console.log(`Searching for YouTube channels with query: ${body.query}`);
      
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(body.query)}&type=channel&maxResults=5&key=${YOUTUBE_API_KEY}`;
      
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        console.error(`YouTube API search error: ${searchResponse.status} ${searchResponse.statusText}`);
        return new Response(JSON.stringify({ 
          error: `YouTube API error: ${searchResponse.status} ${searchResponse.statusText}` 
        }), {
          status: searchResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        return new Response(JSON.stringify({ items: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Get channel IDs from search results
      const channelIds = searchData.items.map(item => item.id.channelId).join(',');
      
      // Now fetch channel details
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&key=${YOUTUBE_API_KEY}`;
      
      const channelResponse = await fetch(channelUrl);
      
      if (!channelResponse.ok) {
        console.error(`YouTube API channel details error: ${channelResponse.status} ${channelResponse.statusText}`);
        return new Response(JSON.stringify({ 
          error: `YouTube API error: ${channelResponse.status} ${channelResponse.statusText}` 
        }), {
          status: channelResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const channelData = await channelResponse.json();
      
      return new Response(JSON.stringify(channelData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (body.operation === "get_channel_details") {
      console.log(`Fetching channel details for: ${body.channelId}`);
      
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${body.channelId}&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`YouTube API error: ${response.status} ${response.statusText}`);
        return new Response(JSON.stringify({ 
          error: `YouTube API error: ${response.status} ${response.statusText}` 
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid operation specified" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("Error details:", JSON.stringify({
      message: error.message || "Unknown error",
      stack: error.stack,
      name: error.name
    }));
    
    return new Response(JSON.stringify({ 
      error: "YouTube API operation failed",
      details: error.message || "Unknown error"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
