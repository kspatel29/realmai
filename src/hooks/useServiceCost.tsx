
import { useMemo } from 'react';

interface ServiceCostParams {
  serviceType: 'dubbing' | 'subtitles' | 'clips' | 'video_generation';
  duration?: number; // in seconds
  languages?: string[];
  isClipGeneration?: boolean;
  isPremiumModel?: boolean;
  enableLipSync?: boolean;
}

export const useServiceCost = ({ 
  serviceType, 
  duration = 60, // default 1 minute
  languages = [], 
  isClipGeneration = false,
  isPremiumModel = false,
  enableLipSync = false
}: ServiceCostParams) => {
  const cost = useMemo(() => {
    const durationInMinutes = Math.ceil(duration / 60);
    
    switch (serviceType) {
      case 'dubbing':
        // Base cost: 5 credits per minute per language
        let dubbingCost = durationInMinutes * languages.length * 5;
        
        // Premium for lip sync: +50% cost
        if (enableLipSync) {
          dubbingCost = Math.ceil(dubbingCost * 1.5);
        }
        
        return dubbingCost;
      
      case 'subtitles':
        // Basic model: 2 credits per minute
        // Premium model: 5 credits per minute
        const subtitleRate = isPremiumModel ? 5 : 2;
        return durationInMinutes * subtitleRate;
      
      case 'clips':
      case 'video_generation':
        // Fixed cost per generated video
        return 15;
      
      default:
        return 0;
    }
  }, [serviceType, duration, languages.length, isPremiumModel, enableLipSync]);

  const breakdown = useMemo(() => {
    const durationInMinutes = Math.ceil(duration / 60);
    
    return {
      duration: durationInMinutes,
      languages: languages.length,
      costPerUnit: serviceType === 'dubbing' ? 5 : serviceType === 'subtitles' ? (isPremiumModel ? 5 : 2) : 15,
      premiumFeatures: {
        lipSync: enableLipSync,
        premiumModel: isPremiumModel
      },
      total: cost
    };
  }, [serviceType, duration, languages.length, isPremiumModel, enableLipSync, cost]);

  return {
    cost,
    breakdown
  };
};
