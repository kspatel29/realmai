
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
    
    // Ensure we have all required fields
    const requestInput = {
      ...input,
      // If start_image is not provided, it will be handled by the edge function
    };
    
    // Call the Supabase Edge Function to generate the video
    const { data, error } = await supabase.functions.invoke('generate-video', {
      body: requestInput
    });
    
    if (error) {
      console.error("Error from edge function:", error);
      throw error;
    }
    
    console.log("Edge function response:", data);
    
    // If we have direct output, return it immediately
    if (data && data.output) {
      return {
        status: "succeeded",
        output: data.output
      };
    }
    
    // If we have a prediction ID, we'll need to check its status
    if (data && data.id) {
      // Poll for the prediction status
      let prediction = await checkReplicatePredictionStatus(data.id);
      let attempts = 0;
      const maxAttempts = 120; // Increased for potentially longer processing time
      
      // Poll until the prediction is complete or failed (or timeout)
      while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
        prediction = await checkReplicatePredictionStatus(data.id);
        attempts++;
        console.log(`Polling attempt ${attempts}, status: ${prediction.status}`);
      }
      
      // Return the output URL for video if available
      if (prediction.status === "succeeded" && prediction.output) {
        return {
          status: "succeeded",
          output: prediction.output
        };
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
