
import { supabase } from "@/integrations/supabase/client";

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
    // Fallback calculation if the edge function fails
    const basePrice = enableLipSync ? 1.035 : 0.535;
    const languageCount = languages.length || 1;
    const costUSD = basePrice * durationMinutes * languageCount;
    return Math.ceil(costUSD * 2 * 15); // Apply profit margin and convert to credits
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
    // Fallback calculation if the edge function fails
    const basePrice = 0.052;
    const costUSD = isPremiumModel ? basePrice * 1.5 : basePrice;
    return Math.ceil(costUSD * 2 * 15); // Apply profit margin and convert to credits
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
    // Fallback calculation if the edge function fails
    const costUSD = 0.4 * durationSeconds;
    return Math.ceil(costUSD * 2 * 15); // Apply profit margin and convert to credits
  }
};
