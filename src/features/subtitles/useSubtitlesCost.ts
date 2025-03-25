
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
        // Calculate cost based on file duration
        cost = await calculateCostFromFileDuration(
          fileDuration,
          "subtitles",
          { isPremiumModel }
        );
      } else {
        // Get basic cost from edge function
        cost = await calculateSubtitlesCost(isPremiumModel);
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
      
      return fallbackCost;
    }
  };

  return {
    calculateCost
  };
};
