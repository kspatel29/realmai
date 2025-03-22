
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
    // Get the API token
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')
    if (!REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set")
      throw new Error("API configuration error: REPLICATE_API_TOKEN is not set")
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    })

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
      console.log("Checking status for prediction:", body.predictionId)
      try {
        const prediction = await replicate.predictions.get(body.predictionId)
        console.log("Status check response:", JSON.stringify(prediction))
        
        // If prediction has succeeded and has output, return it directly
        if (prediction.status === "succeeded" && prediction.output) {
          console.log("Prediction succeeded with output:", prediction.output);
          return new Response(JSON.stringify({ 
            status: "succeeded",
            output: prediction.output 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        
        return new Response(JSON.stringify(prediction), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (error) {
        console.error("Error checking prediction status:", error);
        return new Response(JSON.stringify({ 
          error: `Error checking prediction status: ${error.message}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    // Process input for video generation
    if (!body.prompt) {
      console.error("Missing required field: prompt");
      return new Response(JSON.stringify({ 
        error: "Missing required field: prompt is required" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log("Processing input for video generation:", JSON.stringify(body))
    
    // Define model input based on the Luma Ray Flash 2 720p model requirements
    const input = {
      prompt: body.prompt,
      aspect_ratio: body.aspect_ratio || "16:9",
      duration: body.duration ? parseInt(String(body.duration), 10) : 5
    };
    
    // Add optional parameters if provided
    if (body.start_image_url && typeof body.start_image_url === 'string') {
      input.start_image_url = body.start_image_url;
    }
    
    if (body.end_image_url && typeof body.end_image_url === 'string') {
      input.end_image_url = body.end_image_url;
    }

    if (body.loop !== undefined) {
      input.loop = Boolean(body.loop);
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
      return new Response(JSON.stringify({ 
        error: `Video generation failed: ${error.message}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  } catch (error) {
    console.error("Error in video generation function:", JSON.stringify({
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
