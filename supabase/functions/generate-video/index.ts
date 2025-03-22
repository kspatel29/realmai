
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
      aspect_ratio: body.aspect_ratio || "16:9",
      duration: typeof body.duration === 'number' ? body.duration : parseInt(body.duration, 10) || 5,
      cfg_scale: typeof body.cfg_scale === 'number' ? body.cfg_scale : parseFloat(body.cfg_scale) || 0.5,
    };
    
    // Only add start_image and end_image if they are valid strings with proper URLs
    if (body.start_image && typeof body.start_image === 'string' && body.start_image.startsWith('http')) {
      input.start_image = body.start_image;
    }
    
    if (body.end_image && typeof body.end_image === 'string' && body.end_image.startsWith('http')) {
      input.end_image = body.end_image;
    }
    
    console.log("Cleaned input for Replicate:", JSON.stringify(input));
    
    try {
      // For Kling model, use the verified version ID
      // This is a known working version from the official Replicate model registry
      const MODEL_OWNER = "cjwbw";
      const MODEL_NAME = "klingv1";
      const MODEL_VERSION = "e55d19c6b2e49d05e7888e7a5b4e6b4f5f1ee68b1bc33adb9c04afecf6ab80f4";
      
      console.log(`Using model: ${MODEL_OWNER}/${MODEL_NAME} with version: ${MODEL_VERSION}`);
      
      // Create the prediction using the verified model and version
      const prediction = await replicate.predictions.create({
        version: MODEL_VERSION,
        input: input,
      });
      
      console.log("Prediction created:", JSON.stringify(prediction));
      
      // Return the prediction ID for client polling
      return new Response(JSON.stringify({ 
        id: prediction.id,
        status: prediction.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202,
      });
    } catch (predictionsError) {
      console.error("Predictions API error:", predictionsError);
      
      // Log detailed error information but handle response body consumption carefully
      if (predictionsError.response) {
        try {
          console.error("Response status:", predictionsError.response.status);
          // Only try to get the response text if the body hasn't been consumed
          if (!predictionsError.response.bodyUsed) {
            const respText = await predictionsError.response.text();
            console.error("Response body:", respText);
          } else {
            console.error("Response body already consumed");
          }
        } catch (e) {
          console.error("Could not parse response body:", e);
        }
      }
      
      return new Response(JSON.stringify({ 
        error: "Video generation failed",
        message: predictionsError.message,
        stack: predictionsError.stack,
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
