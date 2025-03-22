
import { useState } from "react";
import { CREDIT_COSTS } from "./subtitlesConstants";

export const useSubtitlesCost = () => {
  const [isFromVideo, setIsFromVideo] = useState(false);
  
  const calculateCost = (modelName?: string): number => {
    let totalCost = CREDIT_COSTS.BASE_COST;
    
    if (!modelName) return totalCost;
    
    if (modelName.includes('large')) {
      totalCost += CREDIT_COSTS.LARGE_MODEL;
    } else if (modelName.includes('medium')) {
      totalCost += CREDIT_COSTS.MEDIUM_MODEL;
    } else if (modelName.includes('small')) {
      totalCost += CREDIT_COSTS.SMALL_MODEL;
    } else if (modelName.includes('tiny')) {
      totalCost += CREDIT_COSTS.TINY_MODEL;
    }
    
    if (isFromVideo) {
      totalCost += 1;
    }
    
    return totalCost;
  };

  return {
    isFromVideo,
    setIsFromVideo,
    calculateCost
  };
};
