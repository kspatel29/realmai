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
  const { data, error } = await supabase.functions.invoke("generate-subtitles", {
    body: params,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.output as SubtitlesResult;
};

export const extractAudioFromVideo = async (videoPath: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("generate-subtitles", {
    body: { extractAudio: true, videoPath },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.audioUrl) {
    throw new Error("Failed to extract audio from video");
  }

  return data.audioUrl;
};

export const checkSubtitlesStatus = async (predictionId: string) => {
  const { data, error } = await supabase.functions.invoke("generate-subtitles", {
    body: { predictionId },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const uploadAudioFile = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

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
