
import { supabase } from "@/integrations/supabase/client";

interface VideoGenerationInput {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio: string;
  duration: number;
  cfg_scale: number;
  start_image?: string;
  end_image?: string;
}

export const createReplicateVideoClip = async (input: VideoGenerationInput): Promise<any> => {
  try {
    console.log("Calling Replicate edge function with input:", input);
    
    // Call the Supabase Edge Function to generate the video
    const { data, error } = await supabase.functions.invoke('generate-video', {
      body: input
    });
    
    if (error) {
      console.error("Error from edge function:", error);
      throw error;
    }
    
    console.log("Edge function response:", data);
    
    // With the direct run approach, we should have the output directly
    if (data && data.output) {
      return data;
    }
    
    // If we have a prediction ID, we'll need to check its status
    if (data && data.id) {
      // Poll for the prediction status
      let prediction = await checkReplicatePredictionStatus(data.id);
      let attempts = 0;
      
      // Poll until the prediction is complete or failed (or timeout)
      while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
        prediction = await checkReplicatePredictionStatus(data.id);
        attempts++;
        console.log(`Polling attempt ${attempts}, status: ${prediction.status}`);
      }
      
      return prediction;
    }
    
    return data;
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

export const checkReplicatePredictionStatus = async (predictionId: string): Promise<any> => {
  try {
    console.log("Checking prediction status:", predictionId);
    
    // Call the Supabase Edge Function to check the prediction status
    const { data, error } = await supabase.functions.invoke('generate-video', {
      body: { predictionId }
    });
    
    if (error) {
      console.error("Error checking prediction status:", error);
      throw error;
    }
    
    console.log("Prediction status:", data);
    return data;
  } catch (error) {
    console.error("Error checking prediction status:", error);
    throw error;
  }
};
