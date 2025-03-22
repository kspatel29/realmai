
import { supabaseClient } from "@/integrations/supabase/client";

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
  const { data, error } = await supabaseClient.functions.invoke("generate-subtitles", {
    body: params,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.output as SubtitlesResult;
};

export const checkSubtitlesStatus = async (predictionId: string) => {
  const { data, error } = await supabaseClient.functions.invoke("generate-subtitles", {
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
  const filePath = `subtitles/${fileName}`;

  const { data, error } = await supabaseClient.storage
    .from('uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  const { data: urlData } = supabaseClient.storage
    .from('uploads')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};
