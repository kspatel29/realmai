
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

// Function to validate API token
const validateApiToken = () => {
  const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
  if (!REPLICATE_API_TOKEN) {
    console.error("REPLICATE_API_TOKEN is not set");
    throw new Error("API configuration error: REPLICATE_API_TOKEN is not set");
  }
  return REPLICATE_API_TOKEN;
};

// Function to initialize Replicate client
const initializeReplicate = (apiToken: string) => {
  return new Replicate({
    auth: apiToken,
  });
};

// Function to check prediction status
const checkPredictionStatus = async (replicate: Replicate, predictionId: string) => {
  try {
    console.log("Checking status for prediction:", predictionId);
    const prediction = await replicate.predictions.get(predictionId);
    console.log("Status check response:", JSON.stringify(prediction));
    return prediction;
  } catch (error) {
    console.error("Error checking prediction status:", error.message, error.stack);
    throw error;
  }
};

// Function to process video generation input
const processVideoInput = (body: any) => {
  // Validate minimum required input
  if (!body.prompt) {
    throw new Error("Missing required field: prompt is required");
  }

  console.log("Processing input for video generation:", JSON.stringify(body));
  
  // Base input with required parameters
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
  
  if (body.start_image && typeof body.start_image === 'string') {
    input.start_image_url = body.start_image;
  }
  
  if (body.end_image && typeof body.end_image === 'string') {
    input.end_image_url = body.end_image;
  }

  if (body.loop !== undefined) {
    input.loop = Boolean(body.loop);
  }
  
  return input;
};

// Function to generate video using Replicate
const generateVideo = async (replicate: Replicate, input: Record<string, any>) => {
  console.log("Using Luma Ray Flash 2 720p model");
  console.log("With input:", JSON.stringify(input));
  
  try {
    console.log("Creating prediction...");
    const prediction = await replicate.predictions.create({
      // Luma Ray Flash 2 720p model
      version: "c9f630c1a6c36e4af6a1d5a4c46ffa6ec4666c03bee6ca5d4e6d94b77aef8170",
      input
    });
    
    console.log("Prediction created successfully:", JSON.stringify(prediction));
    
    return { 
      id: prediction.id,
      status: prediction.status
    };
  } catch (error) {
    console.error("Prediction error:", error);
    throw error;
  }
};

// Function to create error response
const createErrorResponse = (error: any) => {
  console.error("Error details:", JSON.stringify({
    message: error.message || "Unknown error",
    stack: error.stack,
    name: error.name
  }));
  
  // Extract response information if available
  let errorDetails: any = {
    message: error.message || "Unknown error",
    stack: error.stack,
    name: error.name
  };
  
  if (error.response) {
    try {
      errorDetails.status = error.response.status;
      errorDetails.statusText = error.response.statusText;
      
      // Try to get more details from response body
      const responseText = error.response.text ? error.response.text() : null;
      if (responseText) {
        try {
          errorDetails.responseBody = JSON.parse(responseText);
        } catch (e) {
          errorDetails.responseText = responseText;
        }
      }
    } catch (e) {
      console.error("Error extracting response details:", e);
    }
  }
  
  return new Response(JSON.stringify({ 
    error: "Video generation failed",
    details: errorDetails
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 500,
  });
};

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get the API token and initialize Replicate
    const apiToken = validateApiToken();
    const replicate = initializeReplicate(apiToken);

    // Parse the request body
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));

    // If it's a status check request
    if (body.predictionId) {
      const prediction = await checkPredictionStatus(replicate, body.predictionId);
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process input for video generation
    const input = processVideoInput(body);
    
    // Generate the video
    const result = await generateVideo(replicate, input);
    
    // Return the prediction ID for status polling
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 202,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
});
