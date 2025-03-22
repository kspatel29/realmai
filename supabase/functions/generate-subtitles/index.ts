
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper to extract audio using FFmpeg in Replicate
async function extractAudioFromVideo(videoUrl) {
  try {
    console.log("Extracting audio from video:", videoUrl);
    
    // Validate video URL
    if (!videoUrl || typeof videoUrl !== 'string') {
      throw new Error(`Invalid video URL: ${JSON.stringify(videoUrl)}`);
    }
    
    // Use Replicate with ffmpeg to extract audio
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });
    
    // Use the replicate-ffmpeg model for audio extraction
    console.log("Using ffmpeg model: lucataco/ffmpeg:b959eee21a1c1b62cac44b3c7010ffa9df669b0e3d2622ab2718931a62d85e78");
    
    try {
      const output = await replicate.run(
        "lucataco/ffmpeg:b959eee21a1c1b62cac44b3c7010ffa9df669b0e3d2622ab2718931a62d85e78",
        {
          input: {
            input_video: videoUrl,
            command: "-y -i {INPUT} -vn -acodec mp3 -ab 192k {OUTPUT}"
          }
        }
      );
      
      console.log("Audio extraction result:", output);
      
      // Validate extraction output - the expected response is a URL
      if (!output || typeof output !== 'string' || !output.startsWith('http')) {
        console.error("Invalid extraction output:", output);
        throw new Error("Audio extraction failed: Invalid response from ffmpeg model");
      }
      
      return output;
    } catch (replicateError) {
      console.error("Replicate API error:", replicateError);
      const errorDetails = replicateError.message || JSON.stringify(replicateError);
      throw new Error(`Replicate API error during audio extraction: ${errorDetails}`);
    }
  } catch (error) {
    console.error("Error extracting audio:", error);
    throw error;
  }
}

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

    // Log the entire request body for debugging
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    // Parse the body and handle potential JSON parsing errors
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
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If it's an audio extraction request
    if (body.extractAudio && body.videoPath) {
      console.log("Audio extraction requested for:", body.videoPath);
      try {
        const audioUrl = await extractAudioFromVideo(body.videoPath);
        return new Response(JSON.stringify({ audioUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error("Audio extraction failed:", error);
        return new Response(JSON.stringify({ error: `Audio extraction failed: ${error.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
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
      const output = await replicate.run(
        "stayallive/whisper-subtitles:b97ba81004e7132181864c885a76cae0e56bc61caa4190a395f6d8ba45b7a969",
        {
          input: {
            audio_path: body.audioPath,
            model_name: body.modelName || "small",
            language: body.language || "en",
            vad_filter: body.vadFilter !== undefined ? body.vadFilter : true,
          }
        }
      )

      console.log("Generation response:", output);
      
      if (!output || !output.srt_file || !output.vtt_file) {
        console.error("Invalid subtitles generation output:", output);
        return new Response(JSON.stringify({ 
          error: "Subtitles generation failed: Invalid response from model"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      
      return new Response(JSON.stringify({ output }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
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
