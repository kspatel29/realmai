
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

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
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set");
      throw new Error("API configuration error: REPLICATE_API_TOKEN is not set");
    }

    // Initialize the Replicate client
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
        console.error("Error checking prediction status:", error.message, error.stack);
        throw error;
      }
    }

    // Validate input for video generation
    if (!body.prompt) {
      throw new Error("Missing required field: prompt is required");
    }

    console.log("Processing input for video generation:", JSON.stringify(body));
    
    // Process input based on schema
    const input: Record<string, any> = {
      prompt: body.prompt,
      negative_prompt: body.negative_prompt || "",
    };
    
    // Add aspect ratio if provided
    if (body.aspect_ratio) {
      input.aspect_ratio = body.aspect_ratio;
    }
    
    // Add duration if provided
    if (body.duration) {
      input.duration = parseInt(String(body.duration), 10);
    }
    
    // Add cfg_scale if provided
    if (typeof body.cfg_scale === 'number') {
      input.cfg_scale = body.cfg_scale;
    }
    
    // Add start_image if provided
    if (body.start_image && typeof body.start_image === 'string') {
      input.start_image = body.start_image;
    }
    
    // Add end_image if provided
    if (body.end_image && typeof body.end_image === 'string') {
      input.end_image = body.end_image;
    }
    
    console.log("Using Replicate model: kwaivgi/kling-v1.6-pro");
    console.log("With input:", JSON.stringify(input));

    // Try the direct model run method first
    try {
      console.log("Attempting direct model run...");
      const output = await replicate.run(
        "kwaivgi/kling-v1.6-pro",
        { input }
      );
      
      console.log("Direct run successful, output:", output);
      
      // If we have direct output, return it
      return new Response(JSON.stringify({
        status: "succeeded",
        output
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (runError) {
      console.warn("Direct run failed, falling back to predictions API:", runError.message);
      
      // Fall back to the predictions API
      try {
        console.log("Creating prediction via API...");
        const prediction = await replicate.predictions.create({
          version: "33e7a37e190af7e87a32c84ce060872a3ea1675adcab41571a2694e73a4cbefb",
          input
        });
        
        console.log("Prediction created successfully:", JSON.stringify(prediction));
        
        // Return the prediction ID for status polling
        return new Response(JSON.stringify({ 
          id: prediction.id,
          status: prediction.status
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 202,
        });
      } catch (predictionError) {
        console.error("Prediction API error:", predictionError);
        throw predictionError;
      }
    }
  } catch (error) {
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
        const responseText = await error.response.text();
        try {
          errorDetails.responseBody = JSON.parse(responseText);
        } catch (e) {
          errorDetails.responseText = responseText;
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
  }
});
