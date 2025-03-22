
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

    // If it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId);
      try {
        const prediction = await replicate.predictions.get(body.predictionId);
        console.log("Status check response:", JSON.stringify(prediction));
        
        // If prediction has succeeded and has output, return it directly
        if (prediction.status === "succeeded" && prediction.output) {
          console.log("Prediction succeeded with output:", prediction.output);
          return new Response(JSON.stringify({ 
            status: "succeeded",
            output: prediction.output 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
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
      duration: body.duration ? parseInt(String(body.duration), 10) : 5,
      cfg_scale: typeof body.cfg_scale === 'number' ? body.cfg_scale : 0.5,
    };
    
    // Add aspect ratio if provided
    if (body.aspect_ratio) {
      input.aspect_ratio = body.aspect_ratio;
    } else {
      input.aspect_ratio = "16:9"; // Default aspect ratio
    }
    
    // Add start_image if provided
    if (body.start_image && typeof body.start_image === 'string') {
      input.start_image = body.start_image;
    }
    
    // Add end_image if provided
    if (body.end_image && typeof body.end_image === 'string') {
      input.end_image = body.end_image;
    }
    
    console.log("Using Replicate official model: kwaivgi/kling-v1.6-pro");
    console.log("With input:", JSON.stringify(input));

    // Create prediction using the official model approach (no version needed)
    try {
      console.log("Creating prediction...");
      // For official models, we use the run method directly with the model name
      const prediction = await replicate.predictions.create({
        model: "kwaivgi/kling-v1.6-pro",
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
