
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

export interface SubtitleJob {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  srt_url: string | null;
  vtt_url: string | null;
  preview_text: string | null;
  language: string | null;
  model_name: string;
  original_filename: string | null;
  prediction_id: string | null;
  error: string | null;
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

  console.log("Subtitles generation response:", data);
  
  // If we have a direct output, return it
  if (data?.output) {
    return data.output as SubtitlesResult;
  }
  
  // If we have a prediction ID, return a special object that indicates polling is needed
  if (data?.id) {
    // Instead of throwing an error, return an object with the prediction ID
    return {
      predictionId: data.id,
      status: data.status || 'starting'
    };
  }

  throw new Error("Invalid response from subtitles generation service");
};

export const checkSubtitlesStatus = async (predictionId: string) => {
  if (!predictionId) {
    throw new Error("Prediction ID is required");
  }
  
  console.log("Checking status for prediction:", predictionId);
  
  const { data, error } = await supabase.functions.invoke("generate-subtitles", {
    body: { predictionId },
  });

  if (error) {
    console.error("Error checking subtitles status:", error);
    throw new Error(error.message);
  }

  console.log("Status check response:", data);
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

// Create a new subtitle job entry
export const createSubtitleJob = async (params: {
  userId: string;
  modelName: string;
  language?: string;
  originalFilename?: string;
  predictionId?: string;
}): Promise<string> => {
  const { data, error } = await supabase
    .from('subtitle_jobs')
    .insert({
      user_id: params.userId,
      model_name: params.modelName,
      language: params.language || null,
      original_filename: params.originalFilename || null,
      prediction_id: params.predictionId || null,
      status: 'starting'
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating subtitle job:", error);
    throw new Error(`Error creating subtitle job: ${error.message}`);
  }

  return data.id;
};

// Update a subtitle job with results
export const updateSubtitleJob = async (
  jobId: string, 
  updates: Partial<SubtitleJob>
): Promise<void> => {
  const { error } = await supabase
    .from('subtitle_jobs')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId);

  if (error) {
    console.error("Error updating subtitle job:", error);
    throw new Error(`Error updating subtitle job: ${error.message}`);
  }
};

// Fetch all subtitle jobs for a user
export const fetchSubtitleJobs = async (): Promise<SubtitleJob[]> => {
  const { data, error } = await supabase
    .from('subtitle_jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching subtitle jobs:", error);
    throw new Error(`Error fetching subtitle jobs: ${error.message}`);
  }

  return data as SubtitleJob[];
};
