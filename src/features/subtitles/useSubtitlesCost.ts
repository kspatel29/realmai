
import { useState } from "react";
import { CREDIT_COSTS } from "./subtitlesConstants";

export const useSubtitlesCost = () => {
  const calculateCost = (modelName?: string): number => {
    let totalCost = CREDIT_COSTS.BASE_COST;
    
    if (!modelName) return totalCost;
    
    if (modelName === "large-v2") {
      totalCost += CREDIT_COSTS.BEST_QUALITY;
    }
    
    return totalCost;
  };

  return {
    calculateCost
  };
};
