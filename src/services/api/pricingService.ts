
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_CREDIT_COSTS } from "@/constants/pricing";

/**
 * Calculate the cost for dubbing a video
 * @param durationMinutes Duration of the video in minutes
 * @param enableLipSync Whether lip sync is enabled
 * @param languages Array of languages to dub into
 * @returns Promise resolving to the credit cost
 */
export const calculateDubbingCost = async (
  durationMinutes: number, 
  enableLipSync: boolean, 
  languages: string[] = []
): Promise<number> => {
  try {
    const { data, error } = await supabase.functions.invoke("calculate-costs", {
      body: {
        service: "dubbing",
        durationMinutes,
        enableLipSync,
        languages
      }
    });

    if (error) {
      console.error("Error calculating dubbing cost:", error);
      throw error;
    }

    return data.creditCost;
  } catch (error) {
    console.error("Failed to calculate dubbing cost:", error);
    // Fallback calculation using local constants
    const baseCostPerMinute = enableLipSync 
      ? SERVICE_CREDIT_COSTS.DUBBING.LIPSYNC_CREDITS_PER_MINUTE 
      : SERVICE_CREDIT_COSTS.DUBBING.BASE_CREDITS_PER_MINUTE;
    
    const languageCount = languages.length || 1;
    return baseCostPerMinute * durationMinutes * languageCount;
  }
};

/**
 * Calculate the cost for generating subtitles
 * @param isPremiumModel Whether to use the premium model
 * @returns Promise resolving to the credit cost
 */
export const calculateSubtitlesCost = async (isPremiumModel: boolean = false): Promise<number> => {
  try {
    const { data, error } = await supabase.functions.invoke("calculate-costs", {
      body: {
        service: "subtitles",
        isPremiumModel
      }
    });

    if (error) {
      console.error("Error calculating subtitles cost:", error);
      throw error;
    }

    return data.creditCost;
  } catch (error) {
    console.error("Failed to calculate subtitles cost:", error);
    // Fallback calculation using local constants
    return isPremiumModel 
      ? SERVICE_CREDIT_COSTS.SUBTITLES.PREMIUM_CREDITS
      : SERVICE_CREDIT_COSTS.SUBTITLES.BASE_CREDITS;
  }
};

/**
 * Calculate the cost for generating a video clip
 * @param durationSeconds Duration of the video in seconds
 * @returns Promise resolving to the credit cost
 */
export const calculateVideoGenerationCost = async (durationSeconds: number): Promise<number> => {
  try {
    const { data, error } = await supabase.functions.invoke("calculate-costs", {
      body: {
        service: "video_generation",
        durationSeconds
      }
    });

    if (error) {
      console.error("Error calculating video generation cost:", error);
      throw error;
    }

    return data.creditCost;
  } catch (error) {
    console.error("Failed to calculate video generation cost:", error);
    // Fallback calculation using local constants
    return SERVICE_CREDIT_COSTS.VIDEO_GENERATION.CREDITS_PER_SECOND * durationSeconds;
  }
};
