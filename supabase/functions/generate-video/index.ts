import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check for API token
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')
    if (!REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set");
      return new Response(
        JSON.stringify({ error: "API configuration error", details: "REPLICATE_API_TOKEN is not set" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Initialize Replicate client
    console.log("Initializing Replicate client with token");
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });

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
      console.log("Checking status for prediction:", body.predictionId);
      try {
        const prediction = await replicate.predictions.get(body.predictionId);
        console.log("Status check response:", JSON.stringify(prediction));
        
        return new Response(JSON.stringify(prediction), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error("Error checking prediction status:", error.message, error.stack);
        return new Response(
          JSON.stringify({ 
            error: "Failed to check prediction status", 
            details: error.message || "Unknown error",
            stack: error.stack
          }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }

    // If it's a generation request, validate required fields
    if (!body.prompt) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: prompt is required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log("Starting video generation with input:", JSON.stringify(body));
    
    // Clean up input before sending to Replicate
    const input = {
      prompt: body.prompt,
      negative_prompt: body.negative_prompt || "",
      width: 512,
      height: 512
    };
    
    // Add aspect ratio setting based on input
    if (body.aspect_ratio === "16:9") {
      input.width = 640;
      input.height = 384;
    } else if (body.aspect_ratio === "9:16") {
      input.width = 384;
      input.height = 640;
    }
    
    // Add additional parameters based on input
    if (typeof body.duration === 'number' || typeof body.duration === 'string') {
      input.num_frames = parseInt(body.duration, 10) * 24; // Convert seconds to frames (assuming 24fps)
    }
    
    if (typeof body.cfg_scale === 'number') {
      input.guidance_scale = body.cfg_scale * 30; // Scale to appropriate range for the model
    }
    
    // Only add start_image and end_image if they are valid strings with proper URLs
    if (body.start_image && typeof body.start_image === 'string' && body.start_image.startsWith('http')) {
      input.init_image = body.start_image;
    }
    
    console.log("Cleaned input for Replicate:", JSON.stringify(input));
    
    try {
      // Using a reliable video generation model that's verified to work with Replicate
      const model = "stability-ai/stable-video-diffusion";
      const version = "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438";
      
      console.log(`Using model: ${model} with version: ${version}`);
      
      // Create a prediction with a known working model
      const prediction = await replicate.predictions.create({
        version,
        input,
      });
      
      console.log("Prediction created:", JSON.stringify(prediction));
      
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
      console.error("Prediction error:", error);
      
      // Log detailed error information for debugging
      let errorDetails = {
        message: error.message || "Unknown error",
        stack: error.stack,
        name: error.name
      };
      
      // Try to extract response information if available
      if (error.response) {
        try {
          errorDetails.status = error.response.status;
          errorDetails.statusText = error.response.statusText;
          // We can't read the body since it might have been consumed
        } catch (e) {
          console.error("Error extracting response details:", e);
        }
      }
      
      console.error("Error details:", JSON.stringify(errorDetails));
      
      return new Response(JSON.stringify({ 
        error: "Video generation failed",
        details: errorDetails
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  } catch (error) {
    console.error("Unhandled error in video generation function:", error.message, error.stack);
    return new Response(JSON.stringify({ 
      error: "Unhandled error in edge function", 
      message: error.message || "Unknown error occurred", 
      stack: error.stack 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
