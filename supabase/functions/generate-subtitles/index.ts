
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
      const prediction = await replicate.predictions.get(body.predictionId)
      console.log("Status check response:", prediction)
      
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
    }

    // If it's a generation request
    if (!body.audioPath) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: audioPath is required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log("Generating subtitles for audio:", body.audioPath)
    
    try {
      // Start the prediction but don't wait for it to complete
      const prediction = await replicate.predictions.create({
        version: "b97ba81004e7132181864c885a76cae0e56bc61caa4190a395f6d8ba45b7a969",
        input: {
          audio_path: body.audioPath,
          model_name: body.modelName || "small",
          language: body.language || "en",
          vad_filter: body.vadFilter !== undefined ? body.vadFilter : true,
        }
      });
      
      console.log("Prediction created:", prediction);
      
      // Return the prediction ID so the client can poll for status
      return new Response(JSON.stringify({ 
        id: prediction.id,
        status: prediction.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202, // Accepted
      });
    } catch (error) {
      console.error("Subtitles generation failed:", error);
      return new Response(JSON.stringify({ 
        error: `Subtitles generation failed: ${error.message}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  } catch (error) {
    console.error("Error in subtitles generation function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
