
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

// Determine if a file is an audio file based on its extension
export const isAudioFile = (file: File): boolean => {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return audioExtensions.includes(extension);
};
