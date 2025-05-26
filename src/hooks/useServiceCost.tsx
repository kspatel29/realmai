
import { useMemo } from 'react';

interface ServiceCostParams {
  serviceType: 'dubbing' | 'subtitles' | 'clips';
  duration?: number; // in minutes
  languages?: string[];
  isClipGeneration?: boolean;
}

export const useServiceCost = ({ serviceType, duration = 1, languages = [], isClipGeneration = false }: ServiceCostParams) => {
  const cost = useMemo(() => {
    switch (serviceType) {
      case 'dubbing':
        // 10 credits per minute per language
        return Math.ceil(duration) * languages.length * 10;
      
      case 'subtitles':
        // 5 credits per minute per language
        return Math.ceil(duration) * languages.length * 5;
      
      case 'clips':
        // 15 credits per video regardless of length
        return 15;
      
      default:
        return 0;
    }
  }, [serviceType, duration, languages.length]);

  return {
    cost,
    breakdown: {
      duration: Math.ceil(duration),
      languages: languages.length,
      costPerUnit: serviceType === 'dubbing' ? 10 : serviceType === 'subtitles' ? 5 : 15,
      total: cost
    }
  };
};
