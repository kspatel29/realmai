
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper to extract audio from a video URL
async function extractAudioFromVideo(videoUrl) {
  try {
    console.log("Extracting audio from video:", videoUrl);
    
    // Use Replicate to extract audio using the audio-extractor model
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });
    
    // Call the audio extractor model
    console.log("Calling Replicate audio extractor model with URL:", videoUrl);
    const extractionOutput = await replicate.run(
      "vaibhavs10/audio-extractor:3d86abe461f9d7d75da6a205bac8765063b9dbe44d94a511189c28dcdac3e68c",
      {
        input: {
          audio_source: videoUrl,
          audio_format: "wav"
        }
      }
    );
    
    console.log("Audio extraction result:", extractionOutput);
    
    // Validate extraction output - it should contain a URL
    if (!extractionOutput || typeof extractionOutput !== 'string' || !extractionOutput.startsWith('http')) {
      console.error("Invalid extraction output:", extractionOutput);
      throw new Error("Audio extraction failed: Invalid response from extractor");
    }
    
    return extractionOutput;
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

    const body = await req.json()
    console.log("Request body:", JSON.stringify(body));

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
