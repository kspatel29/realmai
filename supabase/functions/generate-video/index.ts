
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

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    })

    const body = await req.json()
    console.log("Request body:", body)

    // If it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId)
      try {
        const prediction = await replicate.predictions.get(body.predictionId)
        console.log("Status check response:", prediction)
        
        return new Response(JSON.stringify(prediction), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (error) {
        console.error("Error checking prediction status:", error)
        return new Response(
          JSON.stringify({ 
            error: "Failed to check prediction status", 
            details: error.message || "Unknown error" 
          }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
    }

    // If it's a generation request
    if (!body.prompt) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: prompt is required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log("Generating video with input:", body)
    
    // Clean up input before sending to Replicate
    const input = {
      prompt: body.prompt,
      negative_prompt: body.negative_prompt || "",
      aspect_ratio: body.aspect_ratio || "16:9",
      duration: typeof body.duration === 'number' ? body.duration : parseInt(body.duration, 10) || 5,
      cfg_scale: typeof body.cfg_scale === 'number' ? body.cfg_scale : parseFloat(body.cfg_scale) || 0.5,
    }
    
    // Only add start_image and end_image if they are valid strings with proper URLs
    if (body.start_image && typeof body.start_image === 'string' && body.start_image.startsWith('http')) {
      input.start_image = body.start_image
    }
    
    if (body.end_image && typeof body.end_image === 'string' && body.end_image.startsWith('http')) {
      input.end_image = body.end_image
    }
    
    console.log("Cleaned input for Replicate:", input)
    
    try {
      // Define the correct model version ID for kling-v1.6-pro
      const MODEL_VERSION = "3a139358cc4ae29264fbcafd6ee8fbd92726dfa35c8b1e1ba03a7e04d8697bbb";
      
      console.log(`Creating prediction with model version: ${MODEL_VERSION}`);
      
      // Start the prediction using the direct run approach
      const output = await replicate.run(
        "kwaivgi/kling-v1.6-pro:3a139358cc4ae29264fbcafd6ee8fbd92726dfa35c8b1e1ba03a7e04d8697bbb",
        { input }
      );
      
      console.log("Prediction result:", output);
      
      // Return the output directly
      return new Response(JSON.stringify({ 
        status: "succeeded",
        output
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (replicateError) {
      console.error("Replicate API error:", replicateError)
      return new Response(JSON.stringify({ 
        error: replicateError.message || "Error creating prediction with Replicate API",
        details: replicateError
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
  } catch (error) {
    console.error("Error in video generation function:", error)
    return new Response(JSON.stringify({ 
      error: error.message || "Unknown error occurred", 
      stack: error.stack 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
