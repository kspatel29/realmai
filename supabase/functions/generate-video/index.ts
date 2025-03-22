
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
      throw new Error('REPLICATE_API_TOKEN is not set')
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    })

    const body = await req.json()
    console.log("Request body:", body)

    // If it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId)
      const prediction = await replicate.predictions.get(body.predictionId)
      console.log("Status check response:", prediction)
      
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
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
    
    // Start the prediction but don't wait for it to complete
    const prediction = await replicate.predictions.create({
      version: "3a139358cc4ae29264fbcafd6ee8fbd92726dfa35c8b1e1ba03a7e04d8697bbb", // kling-v1.6-pro model version
      input: {
        prompt: body.prompt,
        negative_prompt: body.negative_prompt,
        start_image: body.start_image,
        end_image: body.end_image,
        aspect_ratio: body.aspect_ratio,
        duration: body.duration,
        cfg_scale: body.cfg_scale,
      },
    })
    
    console.log("Prediction created:", prediction)
    
    // Return the prediction ID so the client can poll for status
    return new Response(JSON.stringify({ 
      id: prediction.id,
      status: prediction.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 202, // Accepted
    });
  } catch (error) {
    console.error("Error in video generation function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
