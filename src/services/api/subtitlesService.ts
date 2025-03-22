import { supabase } from "@/integrations/supabase/client";

export interface GenerateSubtitlesParams {
  audioPath: string;
  modelName?: string;
  language?: string;
  vadFilter?: boolean;
}

export interface SubtitlesResult {
  preview: string;
  srt_file: string;
  vtt_file: string;
}

export const generateSubtitles = async (params: GenerateSubtitlesParams) => {
  console.log("Calling subtitles generation with params:", params);
  
  const { data, error } = await supabase.functions.invoke("generate-subtitles", {
    body: params,
  });

  if (error) {
    console.error("Subtitles generation error:", error);
    throw new Error(error.message);
  }

  if (!data?.output) {
    console.error("Invalid response from generate-subtitles function:", data);
    throw new Error("Invalid response from subtitles generation service");
  }

  return data.output as SubtitlesResult;
};

export const extractAudioFromVideo = async (videoPath: string): Promise<string> => {
  if (!videoPath) {
    throw new Error("Video path is required");
  }
  
  console.log("Extracting audio from video:", videoPath);
  
  // Validate that the URL is from the correct storage bucket
  if (!videoPath.includes('supabase.co/storage/v1/object/public/uploads/')) {
    console.warn("Video URL doesn't seem to be from the uploads bucket:", videoPath);
  }
  
  try {
    const { data, error } = await supabase.functions.invoke("generate-subtitles", {
      body: { extractAudio: true, videoPath },
    });

    if (error) {
      console.error("Error invoking generate-subtitles function:", error);
      throw error; // Pass the original error through for better debugging
    }

    if (!data?.audioUrl) {
      console.error("Failed to extract audio, response:", data);
      if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Failed to extract audio from video - no audio URL returned");
      }
    }

    console.log("Extracted audio URL:", data.audioUrl);
    return data.audioUrl;
  } catch (error) {
    console.error("Audio extraction error:", error);
    throw error; // Pass the original error through for better debugging
  }
};

export const checkSubtitlesStatus = async (predictionId: string) => {
  if (!predictionId) {
    throw new Error("Prediction ID is required");
  }
  
  const { data, error } = await supabase.functions.invoke("generate-subtitles", {
    body: { predictionId },
  });

  if (error) {
    console.error("Error checking subtitles status:", error);
    throw new Error(error.message);
  }

  return data;
};

export const uploadAudioFile = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("File is required");
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  console.log(`Uploading file ${file.name} to uploads/${filePath}`);
  
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error("Error uploading file:", error);
    throw new Error(`Error uploading file: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  console.log("Uploaded file URL:", urlData.publicUrl);
  return urlData.publicUrl;
};

// Determine if a file is a video file based on its extension
export const isVideoFile = (file: File): boolean => {
  const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'];
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return videoExtensions.includes(extension);
};

// Determine if a file is an audio file based on its extension
export const isAudioFile = (file: File): boolean => {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return audioExtensions.includes(extension);
};
