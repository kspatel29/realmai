
// Define interfaces for Sieve API requests and responses
export interface SieveDubbingRequest {
  function: string;
  inputs: {
    source_file: { url: string };
    target_language: string;
    translation_engine: "sieve-default-translator" | "gpt4" | "seamless";
    voice_engine: 
      | "sieve-default-cloning" 
      | "elevenlabs (voice cloning)" 
      | "openai-alloy (no voice cloning)" 
      | "openai-echo (no voice cloning)" 
      | "openai-onyx (no voice cloning)" 
      | "openai-nova (no voice cloning)" 
      | "openai-shimmer (no voice cloning)" 
      | "elevenlabs-rachel (no voice cloning)" 
      | "elevenlabs-alberto (no voice cloning)" 
      | "elevenlabs-gabriela (no voice cloning)" 
      | "elevenlabs-darine (no voice cloning)" 
      | "elevenlabs-maxime (no voice cloning)";
    transcription_engine: "whisper-zero" | "stable-ts-whisper-large-v3";
    output_mode: "translation-only" | "voice-dubbing";
    edit_segments?: any[];
    return_transcript: boolean;
    preserve_background_audio: boolean;
    safewords: string;
    translation_dictionary: string;
    start_time: number;
    end_time: number;
    enable_lipsyncing: boolean;
    lipsync_backend: "sync-1.9.0-beta" | "sievesync-1.1" | "hummingbird" | "latentsync" | "sievesync" | "musetalk" | "video_retalking";
    lipsync_enhance: "default" | "none";
  };
}

export interface SieveDubbingResponse {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed";
  outputs?: {
    output_0: {
      url: string;
    };
  };
  error?: string;
}

export interface SieveLanguage {
  code: string;
  name: string;
  flag: string;
}

// List of supported languages with country flags
export const SUPPORTED_LANGUAGES: SieveLanguage[] = [
  { code: "english", name: "English", flag: "🇺🇸" },
  { code: "spanish", name: "Spanish", flag: "🇪🇸" },
  { code: "french", name: "French", flag: "🇫🇷" },
  { code: "german", name: "German", flag: "🇩🇪" },
  { code: "italian", name: "Italian", flag: "🇮🇹" },
  { code: "portuguese", name: "Portuguese", flag: "🇵🇹" },
  { code: "russian", name: "Russian", flag: "🇷🇺" },
  { code: "japanese", name: "Japanese", flag: "🇯🇵" },
  { code: "korean", name: "Korean", flag: "🇰🇷" },
  { code: "chinese", name: "Mandarin (Chinese)", flag: "🇨🇳" },
  { code: "arabic", name: "Arabic", flag: "🇦🇪" },
  { code: "hindi", name: "Hindi", flag: "🇮🇳" },
  { code: "indonesian", name: "Indonesian", flag: "🇮🇩" },
  { code: "dutch", name: "Dutch", flag: "🇳🇱" },
  { code: "turkish", name: "Turkish", flag: "🇹🇷" },
  { code: "polish", name: "Polish", flag: "🇵🇱" },
  { code: "swedish", name: "Swedish", flag: "🇸🇪" },
  { code: "tagalog", name: "Tagalog (Filipino)", flag: "🇵🇭" },
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
  { code: "tamil", name: "Tamil", flag: "🇮🇳" },
];

export const VOICE_ENGINES = [
  { value: "elevenlabs (voice cloning)", label: "ElevenLabs (Voice Cloning)" },
  { value: "sieve-default-cloning", label: "Sieve Default (Voice Cloning)" },
  { value: "openai-alloy (no voice cloning)", label: "OpenAI Alloy" },
  { value: "openai-echo (no voice cloning)", label: "OpenAI Echo" },
  { value: "openai-onyx (no voice cloning)", label: "OpenAI Onyx" },
  { value: "openai-nova (no voice cloning)", label: "OpenAI Nova" },
  { value: "openai-shimmer (no voice cloning)", label: "OpenAI Shimmer" },
  { value: "elevenlabs-rachel (no voice cloning)", label: "ElevenLabs Rachel" },
  { value: "elevenlabs-alberto (no voice cloning)", label: "ElevenLabs Alberto" },
  { value: "elevenlabs-gabriela (no voice cloning)", label: "ElevenLabs Gabriela" },
  { value: "elevenlabs-darine (no voice cloning)", label: "ElevenLabs Darine" },
  { value: "elevenlabs-maxime (no voice cloning)", label: "ElevenLabs Maxime" },
];

export const TRANSLATION_ENGINES = [
  { value: "sieve-default-translator", label: "Sieve Default Translator" },
  { value: "gpt4", label: "GPT-4" },
  { value: "seamless", label: "Seamless" },
];

export const LIPSYNC_BACKENDS = [
  { value: "sievesync-1.1", label: "Sieve Sync 1.1" },
  { value: "sync-1.9.0-beta", label: "Sync 1.9.0 Beta" },
  { value: "hummingbird", label: "Hummingbird" },
  { value: "latentsync", label: "Latent Sync" },
  { value: "sievesync", label: "Sieve Sync" },
  { value: "musetalk", label: "Muse Talk" },
  { value: "video_retalking", label: "Video Retalking" },
];

// The API key should come from environment variables or secure storage
const SIEVE_API_KEY = "j1VbRemG8Mymh9HXGlGEK0YDqTQCA5BNJa7thj4z_64";
const SIEVE_API_URL = "https://mango.sievedata.com/v2";

/**
 * Submit a video for dubbing
 */
export const submitVideoDubbing = async (
  videoUrl: string,
  options: Partial<SieveDubbingRequest["inputs"]> = {}
): Promise<SieveDubbingResponse> => {
  try {
    const defaultInputs = {
      source_file: { url: videoUrl },
      target_language: "spanish",
      translation_engine: "gpt4" as const,
      voice_engine: "elevenlabs (voice cloning)" as const,
      transcription_engine: "whisper-zero" as const,
      output_mode: "voice-dubbing" as const,
      return_transcript: false,
      preserve_background_audio: true,
      safewords: "",
      translation_dictionary: "",
      start_time: 0,
      end_time: -1,
      enable_lipsyncing: false,
      lipsync_backend: "sievesync-1.1" as const,
      lipsync_enhance: "default" as const,
    };

    const requestBody: SieveDubbingRequest = {
      function: "sieve/dubbing",
      inputs: { ...defaultInputs, ...options },
    };

    const response = await fetch(`${SIEVE_API_URL}/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": SIEVE_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit dubbing job: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting dubbing job:", error);
    throw error;
  }
};

/**
 * Check the status of a dubbing job
 */
export const checkDubbingJobStatus = async (jobId: string): Promise<SieveDubbingResponse> => {
  try {
    const response = await fetch(`${SIEVE_API_URL}/jobs/${jobId}`, {
      method: "GET",
      headers: {
        "X-API-Key": SIEVE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check job status: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking job status:", error);
    throw error;
  }
};

/**
 * Upload a file to a temporary URL that can be used by Sieve
 * In a real application, this would upload to your own storage and return a public URL
 */
export const getFileUploadUrl = async (file: File): Promise<string> => {
  // In a real application, you would upload the file to your server or cloud storage
  // and return a public URL that Sieve can access
  
  // For demonstration purposes, we're just creating a mock URL
  // This would need to be replaced with actual file upload logic
  return URL.createObjectURL(file);
};
