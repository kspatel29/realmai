
import { toast } from "sonner";

const API_KEY = 'j1VbRemG8Mymh9HXGlGEK0YDqTQCA5BNJa7thj4z_64';
const API_BASE_URL = 'https://mango.sievedata.com/v2';

export interface SieveLanguage {
  code: string;
  name: string;
  flag: string;
}

export interface SieveDubbingResponse {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed" | "finished";
  created_at: string;
  updated_at: string;
  function: string;
  inputs: Record<string, any>;
  outputs?: {
    output_0?: {
      url: string;
    };
  };
  error?: {
    message: string;
  };
}

export const SUPPORTED_LANGUAGES: SieveLanguage[] = [
  { code: "english", name: "English", flag: "🇺🇸" },
  { code: "hindi", name: "Hindi", flag: "🇮🇳" },
  { code: "portuguese", name: "Portuguese", flag: "🇵🇹" },
  { code: "mandarin", name: "Mandarin", flag: "🇨🇳" },
  { code: "spanish", name: "Spanish", flag: "🇪🇸" },
  { code: "french", name: "French", flag: "🇫🇷" },
  { code: "german", name: "German", flag: "🇩🇪" },
  { code: "japanese", name: "Japanese", flag: "🇯🇵" },
  { code: "arabic", name: "Arabic", flag: "🇦🇪" },
  { code: "russian", name: "Russian", flag: "🇷🇺" },
  { code: "korean", name: "Korean", flag: "🇰🇷" },
  { code: "indonesian", name: "Indonesian", flag: "🇮🇩" },
  { code: "italian", name: "Italian", flag: "🇮🇹" },
  { code: "dutch", name: "Dutch", flag: "🇳🇱" },
  { code: "turkish", name: "Turkish", flag: "🇹🇷" },
  { code: "polish", name: "Polish", flag: "🇵🇱" },
  { code: "swedish", name: "Swedish", flag: "🇸🇪" },
  { code: "tagalog", name: "Tagalog", flag: "🇵🇭" },
  { code: "malay", name: "Malay", flag: "🇲🇾" },
  { code: "romanian", name: "Romanian", flag: "🇷🇴" },
  { code: "ukrainian", name: "Ukrainian", flag: "🇺🇦" },
  { code: "greek", name: "Greek", flag: "🇬🇷" },
  { code: "czech", name: "Czech", flag: "🇨🇿" },
  { code: "danish", name: "Danish", flag: "🇩🇰" },
  { code: "finnish", name: "Finnish", flag: "🇫🇮" },
  { code: "bulgarian", name: "Bulgarian", flag: "🇧🇬" },
  { code: "croatian", name: "Croatian", flag: "🇭🇷" },
  { code: "slovak", name: "Slovak", flag: "🇸🇰" },
  { code: "tamil", name: "Tamil", flag: "🇮🇳" }
];

export const LIPSYNC_BACKENDS = [
  { value: "sievesync-1.1", label: "SieveSync 1.1 (Recommended)" },
  { value: "sync-1.9.0-beta", label: "Sync 1.9.0 Beta" },
  { value: "hummingbird", label: "Hummingbird" },
  { value: "latentsync", label: "LatentSync" }
];

export const getFileUploadUrl = async (fileName: string, contentType: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/push/inputs/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        fileName,
        contentType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get upload URL');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error getting file upload URL:', error);
    throw error;
  }
};

export const submitVideoDubbing = async (videoUrl: string, options: {
  target_language: string;
  enable_voice_cloning?: boolean;
  preserve_background_audio?: boolean;
  enable_lipsyncing?: boolean;
  safewords?: string;
  translation_dictionary?: string;
  start_time?: number;
  end_time?: number;
}) => {
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

    const response = await fetch(`${API_BASE_URL}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit dubbing job');
    }

    const data = await response.json();
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
    console.log(`Checking status for job ${jobId}`);
    
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error response from API for job ${jobId}:`, errorData);
      
      return {
        id: jobId,
        status: "failed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        function: "sieve/dubbing",
        inputs: {},
        error: {
          message: errorData.message || `Failed with HTTP status ${response.status}`
        }
      };
    }

    const data = await response.json();
    console.log(`Raw API response for job ${jobId}:`, JSON.stringify(data, null, 2));
    
    // Create a response object that matches our expected format
    const result: SieveDubbingResponse = {
      id: data.id,
      status: data.status,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      function: data.function || "sieve/dubbing",
      inputs: data.inputs || {},
    };
    
    // Handle "finished" status from Sieve API (it means completed successfully)
    if (result.status === "finished") {
      result.status = "succeeded";
    }
    
    // Extract the output URL if available
    if (data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      // Create the output_0 property in the format our app expects
      if (data.outputs[0].data && data.outputs[0].data.url) {
        result.outputs = {
          output_0: {
            url: data.outputs[0].data.url
          }
        };
        // If we have a URL, the job is definitely successful
        result.status = "succeeded";
        console.log(`Job ${jobId} has output URL: ${data.outputs[0].data.url}`);
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
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error verifying output URL:', error);
    return false;
  }
};
