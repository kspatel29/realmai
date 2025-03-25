
import { useState } from "react";
import { CREDIT_COSTS } from "./subtitlesConstants";
import { calculateSubtitlesCost, calculateCostFromFileDuration } from "@/services/api/pricingService";

export const useSubtitlesCost = () => {
  const [costCache, setCostCache] = useState<{[key: string]: number}>({});
  
  const calculateCost = async (modelName?: string, fileDuration?: number): Promise<number> => {
    // Generate a cache key
    const cacheKey = `${modelName || 'default'}_${fileDuration || 0}`;
    
    // Use cached value if available
    if (costCache[cacheKey]) {
      return costCache[cacheKey];
    }
    
    // Determine if premium model
    const isPremiumModel = modelName === "large-v2";
    
    try {
      let cost: number;
      
      if (fileDuration) {
        console.log(`Calculating cost for subtitles with model ${modelName} and duration ${fileDuration} seconds`);
        
        // Calculate cost based on file duration
        cost = await calculateCostFromFileDuration(
          fileDuration,
          "subtitles",
          { isPremiumModel }
        );
        
        console.log(`Subtitles cost for ${fileDuration}s with ${isPremiumModel ? 'premium' : 'standard'} model: ${cost} credits`);
      } else {
        // Get basic cost from edge function
        cost = await calculateSubtitlesCost(isPremiumModel);
        console.log(`Base subtitles cost for ${isPremiumModel ? 'premium' : 'standard'} model: ${cost} credits`);
      }
      
      // Cache the result
      setCostCache(prev => ({...prev, [cacheKey]: cost}));
      
      return cost;
    } catch (error) {
      console.error("Error calculating subtitles cost:", error);
      
      // Fallback to local calculation if edge function fails
      let fallbackCost = CREDIT_COSTS.BASE_COST;
      
      if (isPremiumModel) {
        fallbackCost += CREDIT_COSTS.BEST_QUALITY;
      }
      
      // Scale cost based on duration (if provided)
      if (fileDuration) {
        const durationMultiplier = Math.max(1, fileDuration / 60 / 10);
        fallbackCost = Math.ceil(fallbackCost * durationMultiplier);
        
        console.log(`Fallback subtitles cost calculation: ${CREDIT_COSTS.BASE_COST} * ${durationMultiplier} = ${fallbackCost} credits`);
      }
      
      return fallbackCost;
    }
  };

  return {
    calculateCost
  };
};
