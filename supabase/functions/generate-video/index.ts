import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

// Validate API token
function validateApiToken() {
  const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
  if (!REPLICATE_API_TOKEN) {
    console.error("REPLICATE_API_TOKEN is not set");
    throw new Error("API configuration error: REPLICATE_API_TOKEN is not set");
  }
  return REPLICATE_API_TOKEN;
}

// Initialize Replicate client
function initializeReplicate(token: string) {
  return new Replicate({
    auth: token,
  });
}

// Check prediction status
async function checkPredictionStatus(replicate: Replicate, predictionId: string) {
  console.log("Checking status for prediction:", predictionId);
  try {
    const prediction = await replicate.predictions.get(predictionId);
    console.log("Status check response:", JSON.stringify(prediction));
    
    return prediction;
  } catch (error) {
    console.error("Error checking prediction status:", error.message, error.stack);
    throw error;
  }
}

// Process input for video generation
function processVideoInput(body: any) {
  if (!body.prompt) {
    throw new Error("Missing required field: prompt is required");
  }

  console.log("Processing input for video generation:", JSON.stringify(body));
  
  // Base input configuration
  const input: Record<string, any> = {
    prompt: body.prompt,
    negative_prompt: body.negative_prompt || "",
  };
  
  // Add aspect ratio setting based on input
  if (body.aspect_ratio === "16:9") {
    input.width = 640;
    input.height = 384;
  } else if (body.aspect_ratio === "9:16") {
    input.width = 384;
    input.height = 640;
  } else {
    input.width = 512;
    input.height = 512;
  }
  
  // Add additional parameters based on input
  if (typeof body.duration === 'number' || typeof body.duration === 'string') {
    input.num_frames = parseInt(String(body.duration), 10) * 24; // Convert seconds to frames (assuming 24fps)
  }
  
  if (typeof body.cfg_scale === 'number') {
    input.guidance_scale = body.cfg_scale * 30; // Scale to appropriate range for the model
  }
  
  // Only add start_image if valid
  if (body.start_image && typeof body.start_image === 'string' && body.start_image.startsWith('http')) {
    input.init_image = body.start_image;
  }
  
  console.log("Processed input for Replicate:", JSON.stringify(input));
  
  return input;
}

// Generate video using Stable Video Diffusion
async function generateVideo(replicate: Replicate, input: Record<string, any>) {
  console.log("Starting video generation with Stable Video Diffusion");
  
  // Using a reliable video generation model
  const model = "stability-ai/stable-video-diffusion";
  const version = "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438";
  
  try {
    console.log(`Using model: ${model} with version: ${version}`);
    
    // Create a prediction
    const prediction = await replicate.predictions.create({
      version,
      input,
    });
    
    console.log("Prediction created:", JSON.stringify(prediction));
    return prediction;
  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
}

// Create error response
function createErrorResponse(error: any) {
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
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Validate API token and initialize Replicate
    const apiToken = validateApiToken();
    const replicate = initializeReplicate(apiToken);

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request body", details: parseError.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // If it's a status check request
    if (body.predictionId) {
      const prediction = await checkPredictionStatus(replicate, body.predictionId);
      
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process input for video generation
    const input = processVideoInput(body);
    
    // Generate video
    const prediction = await generateVideo(replicate, input);
    
    // If we have a quick result, return it directly
    if (prediction.output) {
      return new Response(JSON.stringify({
        status: "succeeded",
        output: prediction.output
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Otherwise return the prediction ID for status polling
    return new Response(JSON.stringify({ 
      id: prediction.id,
      status: prediction.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 202,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
});
