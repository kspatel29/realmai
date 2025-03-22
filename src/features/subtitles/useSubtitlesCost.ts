
import { useState, useEffect } from "react";
import { CREDIT_COSTS } from "./subtitlesConstants";
import { calculateSubtitlesCost } from "@/services/api/pricingService";

export const useSubtitlesCost = () => {
  const [costCache, setCostCache] = useState<{[key: string]: number}>({});
  
  const calculateCost = async (modelName?: string): Promise<number> => {
    // Use cached value if available
    if (modelName && costCache[modelName]) {
      return costCache[modelName];
    }
    
    // Determine if premium model
    const isPremiumModel = modelName === "large-v2";
    
    try {
      // Get cost from edge function
      const cost = await calculateSubtitlesCost(isPremiumModel);
      
      // Cache the result
      if (modelName) {
        setCostCache(prev => ({...prev, [modelName]: cost}));
      }
      
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
