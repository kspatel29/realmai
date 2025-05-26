
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

    // Validate input for video generation - check if prompt exists and is not empty
    if (!body.prompt || body.prompt.trim() === '') {
      throw new Error("Missing required field: prompt is required and cannot be empty");
    }

    console.log("Processing input for video generation:", JSON.stringify(body));
    
    // Process input based on Luma Ray Flash schema - map fields correctly
    const input: Record<string, any> = {
      prompt: body.prompt.trim(),
      duration: body.duration ? parseInt(String(body.duration), 10) : 5,
      aspect_ratio: body.aspect_ratio || "16:9",
      loop: body.loop || false,
    };
    
    // Add optional fields if provided - map to correct API field names
    if (body.start_image_url && typeof body.start_image_url === 'string') {
      input.start_image_url = body.start_image_url;
      console.log("Added start_image_url to input");
    }
    
    if (body.end_image_url && typeof body.end_image_url === 'string') {
      input.end_image_url = body.end_image_url;
      console.log("Added end_image_url to input");
    }

    if (body.concepts && Array.isArray(body.concepts)) {
      input.concepts = body.concepts;
    }
    
    console.log("Using Luma Ray Flash model: luma/ray-flash-2-720p");
    console.log("Final input for API:", JSON.stringify(input));

    // Create prediction using the Luma Ray Flash model
    try {
      console.log("Creating prediction...");
      const prediction = await replicate.predictions.create({
        model: "luma/ray-flash-2-720p",
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
