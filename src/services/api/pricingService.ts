
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_CREDIT_COSTS } from "@/constants/pricing";
import { stripeService } from "./stripeService";

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
    const cost = await stripeService.calculateCostFromDuration({
      service: "dubbing",
      durationMinutes,
      enableLipSync,
      languages
    });
    
    return cost;
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
    const cost = await stripeService.calculateCostFromDuration({
      service: "subtitles",
      isPremiumModel
    });
    
    return cost;
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
    const cost = await stripeService.calculateCostFromDuration({
      service: "video_generation",
      durationSeconds
    });
    
    return cost;
  } catch (error) {
    console.error("Failed to calculate video generation cost:", error);
    // Fallback calculation using local constants
    return SERVICE_CREDIT_COSTS.VIDEO_GENERATION.CREDITS_PER_SECOND * durationSeconds;
  }
};

/**
 * Calculate the cost based on file duration
 * @param fileDuration Duration of the file in seconds
 * @param service The service type (dubbing, subtitles, or video_generation)
 * @param additionalParams Additional parameters for cost calculation
 * @returns Promise resolving to the credit cost
 */
export const calculateCostFromFileDuration = async (
  fileDuration: number,
  service: "dubbing" | "subtitles" | "video_generation",
  additionalParams: {
    enableLipSync?: boolean,
    isPremiumModel?: boolean,
    languages?: string[]
  } = {}
): Promise<number> => {
  console.log(`Calculating cost for ${service} with duration ${fileDuration} seconds:`, additionalParams);
  
  // Convert to minutes for dubbing and subtitles
  const durationMinutes = service !== "video_generation" ? fileDuration / 60 : undefined;
  
  // Use seconds for video generation
  const durationSeconds = service === "video_generation" ? fileDuration : undefined;
  
  try {
    const cost = await stripeService.calculateCostFromDuration({
      service,
      durationMinutes,
      durationSeconds,
      ...additionalParams
    });
    
    return cost;
  } catch (error) {
    console.error(`Failed to calculate ${service} cost:`, error);
    
    // Fallback calculations
    if (service === "dubbing" && durationMinutes) {
      const { enableLipSync, languages } = additionalParams;
      const baseCostPerMinute = enableLipSync 
        ? SERVICE_CREDIT_COSTS.DUBBING.LIPSYNC_CREDITS_PER_MINUTE 
        : SERVICE_CREDIT_COSTS.DUBBING.BASE_CREDITS_PER_MINUTE;
      
      const languageCount = languages?.length || 1;
      return Math.ceil(baseCostPerMinute * durationMinutes * languageCount);
    } 
    else if (service === "subtitles") {
      const { isPremiumModel } = additionalParams;
      return isPremiumModel 
        ? SERVICE_CREDIT_COSTS.SUBTITLES.PREMIUM_CREDITS
        : SERVICE_CREDIT_COSTS.SUBTITLES.BASE_CREDITS;
    } 
    else if (service === "video_generation" && durationSeconds) {
      return Math.ceil(SERVICE_CREDIT_COSTS.VIDEO_GENERATION.CREDITS_PER_SECOND * durationSeconds);
    }
    
    return 0;
  }
};
