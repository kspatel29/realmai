
import { toast } from "sonner";
import { API_BASE_URL } from './config';
import { SieveDubbingResponse, DubbingOptions } from './types';
import { supabase } from "@/integrations/supabase/client";

export const submitVideoDubbing = async (videoUrl: string, options: DubbingOptions) => {
  try {
    const voice_engine = options.enable_voice_cloning ? "sieve-default-cloning" : "openai-alloy (no voice cloning)";

    const payload = {
      function: "sieve/dubbing",
      inputs: {
        source_file: { url: videoUrl },
        target_language: options.target_language,
        translation_engine: "sieve-default-translator",
        voice_engine,
        transcription_engine: "whisper-zero",
        output_mode: "voice-dubbing",
        return_transcript: false,
        preserve_background_audio: options.preserve_background_audio ?? true,
        safewords: options.safewords || "",
        translation_dictionary: options.translation_dictionary || "",
        start_time: options.start_time ?? 0,
        end_time: options.end_time ?? -1,
        enable_lipsyncing: options.enable_lipsyncing ?? false,
        lipsync_backend: "sievesync-1.1",
        lipsync_enhance: "default"
      }
    };

    console.log("Submitting dubbing job with payload:", JSON.stringify(payload, null, 2));

    // Call the Supabase Edge Function to submit the dubbing job
    const { data, error } = await supabase.functions.invoke('video-dubbing', {
      body: {
        action: "submit_job",
        apiBaseUrl: API_BASE_URL,
        payload
      }
    });

    if (error) {
      console.error('Error from edge function:', error);
      throw new Error(error.message || 'Failed to submit dubbing job');
    }

    console.log("Dubbing job submitted successfully:", data);
    return data;
  } catch (error) {
    console.error('Error submitting dubbing job:', error);
    toast.error(`Failed to submit dubbing job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

export const checkDubbingJobStatus = async (jobId: string): Promise<SieveDubbingResponse> => {
  try {
    console.log(`Making API request to check status for job ${jobId}`);
    
    // Call the Supabase Edge Function to check the job status
    const { data, error } = await supabase.functions.invoke('video-dubbing', {
      body: {
        action: "check_status",
        apiBaseUrl: API_BASE_URL,
        jobId
      }
    });
    
    if (error) {
      console.error(`Error from edge function for job ${jobId}:`, error);
      
      return {
        id: jobId,
        status: "failed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        function: "sieve/dubbing",
        inputs: {},
        error: {
          message: error.message || `Failed to check job status`
        }
      };
    }

    console.log(`Raw API response for job ${jobId}:`, JSON.stringify(data, null, 2));
    
    // Create a response object that matches our expected format
    const result: SieveDubbingResponse = {
      id: data.id,
      status: data.status,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      function: data.function?.name || "dubbing",
      inputs: data.inputs || {},
    };
    
    // Handle "finished" status from Sieve API (it means completed successfully)
    if (result.status === "finished") {
      result.status = "succeeded";
    }
    
    // Extract the output URL if available - handle both API response formats
    if (data.outputs) {
      // Handle array format outputs
      if (Array.isArray(data.outputs) && data.outputs.length > 0) {
        if (data.outputs[0].data && data.outputs[0].data.url) {
          result.outputs = {
            output_0: {
              url: data.outputs[0].data.url
            }
          };
          result.status = "succeeded";
          console.log(`Job ${jobId} has output URL: ${data.outputs[0].data.url}`);
        }
      } 
      // Handle object format outputs
      else if (typeof data.outputs === 'object' && data.outputs.output_0?.url) {
        result.outputs = {
          output_0: {
            url: data.outputs.output_0.url
          }
        };
        result.status = "succeeded";
        console.log(`Job ${jobId} has output URL: ${data.outputs.output_0.url}`);
      }
    }
    
    // Handle error cases
    if (data.error) {
      result.error = {
        message: typeof data.error === 'string' ? data.error : 
                 data.error.message || 'Unknown error'
      };
      result.status = "failed";
    }
    
    return result;
  } catch (error) {
    console.error(`Error checking job status for ${jobId}:`, error);
    
    return {
      id: jobId,
      status: "failed",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      function: "sieve/dubbing",
      inputs: {},
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }
    };
  }
};

export const verifyOutputUrl = async (url: string): Promise<boolean> => {
  try {
    // Simple HEAD request to verify the URL exists
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Error verifying URL ${url}:`, error);
    return false;
  }
};
