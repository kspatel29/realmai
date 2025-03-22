
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Function to handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get the API token
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set");
      throw new Error("API configuration error: REPLICATE_API_TOKEN is not set");
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });

    // Parse the request body
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));

    // If it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId);
      try {
        const prediction = await replicate.predictions.get(body.predictionId);
        console.log("Status check response:", JSON.stringify(prediction));
        return new Response(JSON.stringify(prediction), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error("Error checking prediction status:", error.message);
        throw error;
      }
    }

    // Process input for video generation
    if (!body.prompt) {
      throw new Error("Missing required field: prompt is required");
    }

    console.log("Processing input for video generation:", JSON.stringify(body));
    
    // Define model input based on the Luma Ray Flash 2 720p model requirements
    const input: Record<string, any> = {
      prompt: body.prompt,
    };
    
    // Add optional parameters if provided
    if (body.aspect_ratio) {
      input.aspect_ratio = body.aspect_ratio;
    }
    
    if (body.duration) {
      input.duration = parseInt(String(body.duration), 10);
    }
    
    if (body.start_image_url && typeof body.start_image_url === 'string') {
      input.start_image_url = body.start_image_url;
    }
    
    if (body.end_image_url && typeof body.end_image_url === 'string') {
      input.end_image_url = body.end_image_url;
    }

    if (body.loop !== undefined) {
      input.loop = Boolean(body.loop);
    }
    
    if (body.cfg_scale !== undefined) {
      input.cfg_scale = Number(body.cfg_scale);
    }
    
    console.log("Using Luma Ray Flash 2 720p model");
    console.log("With input:", JSON.stringify(input));
    
    // Create prediction with the Luma Ray Flash 2 720p model
    try {
      console.log("Creating prediction...");
      const prediction = await replicate.predictions.create({
        // Luma Ray Flash 2 720p model
        version: "c9f630c1a6c36e4af6a1d5a4c46ffa6ec4666c03bee6ca5d4e6d94b77aef8170",
        input
      });
      
      console.log("Prediction created successfully:", JSON.stringify(prediction));
      
      return new Response(JSON.stringify({ 
        id: prediction.id,
        status: prediction.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202,
      });
    } catch (error) {
      console.error("Prediction error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error details:", JSON.stringify({
      message: error.message || "Unknown error",
      stack: error.stack,
      name: error.name
    }));
    
    return new Response(JSON.stringify({ 
      error: "Video generation failed",
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
