
import { supabase } from "@/integrations/supabase/client";

// Interface for the dubbing cost calculation request
interface DubbingCostRequest {
  service: 'dubbing';
  durationMinutes: number;
  enableLipSync: boolean;
  languages: string[];
}

// Interface for the subtitles cost calculation request
interface SubtitlesCostRequest {
  service: 'subtitles';
  isPremiumModel: boolean;
}

// Interface for the video generation cost calculation request
interface VideoGenerationCostRequest {
  service: 'video_generation';
  durationSeconds: number;
}

// Union type for all cost calculation requests
type CostCalculationRequest = 
  | DubbingCostRequest 
  | SubtitlesCostRequest 
  | VideoGenerationCostRequest;

// Response from the cost calculation
interface CostCalculationResponse {
  creditCost: number;
  usdEquivalent: number;
}

/**
 * Calculate the cost of a service in credits
 */
export const calculateServiceCost = async (
  request: CostCalculationRequest
): Promise<CostCalculationResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('calculate-costs', {
      body: JSON.stringify(request),
    });

    if (error) {
      console.error('Error calculating service cost:', error);
      throw new Error(error.message || 'Failed to calculate service cost');
    }

    return data as CostCalculationResponse;
  } catch (error) {
    console.error('Error in calculateServiceCost:', error);
    throw error;
  }
};

/**
 * Calculate dubbing cost based on duration, lip sync option, and number of languages
 */
export const calculateDubbingCost = async (
  durationMinutes: number,
  enableLipSync: boolean,
  languages: string[]
): Promise<number> => {
  try {
    const { creditCost } = await calculateServiceCost({
      service: 'dubbing',
      durationMinutes,
      enableLipSync,
      languages
    });
    
    return creditCost;
  } catch (error) {
    console.error('Error calculating dubbing cost:', error);
    // Return a fallback cost estimation from the client-side constants
    // This is not ideal but prevents the UI from breaking if the function fails
    const { SERVICE_CREDIT_COSTS } = await import('@/constants/pricing');
    const costPerMinute = enableLipSync 
      ? SERVICE_CREDIT_COSTS.DUBBING.LIPSYNC_CREDITS_PER_MINUTE 
      : SERVICE_CREDIT_COSTS.DUBBING.BASE_CREDITS_PER_MINUTE;
    return Math.ceil(costPerMinute * durationMinutes * languages.length);
  }
};

/**
 * Calculate subtitles cost based on model quality
 */
export const calculateSubtitlesCost = async (
  isPremiumModel: boolean
): Promise<number> => {
  try {
    const { creditCost } = await calculateServiceCost({
      service: 'subtitles',
      isPremiumModel
    });
    
    return creditCost;
  } catch (error) {
    console.error('Error calculating subtitles cost:', error);
    // Return a fallback cost from the client-side constants
    const { SERVICE_CREDIT_COSTS } = await import('@/constants/pricing');
    return isPremiumModel 
      ? SERVICE_CREDIT_COSTS.SUBTITLES.PREMIUM_CREDITS 
      : SERVICE_CREDIT_COSTS.SUBTITLES.BASE_CREDITS;
  }
};

/**
 * Calculate video generation cost based on duration in seconds
 */
export const calculateVideoGenerationCost = async (
  durationSeconds: number
): Promise<number> => {
  try {
    const { creditCost } = await calculateServiceCost({
      service: 'video_generation',
      durationSeconds
    });
    
    return creditCost;
  } catch (error) {
    console.error('Error calculating video generation cost:', error);
    // Return a fallback cost from the client-side constants
    const { SERVICE_CREDIT_COSTS } = await import('@/constants/pricing');
    return Math.ceil(SERVICE_CREDIT_COSTS.VIDEO_GENERATION.CREDITS_PER_SECOND * durationSeconds);
  }
};

// Export service pricing for reference
export { SUBSCRIPTION_PLANS, CREDIT_PACKAGES } from '@/constants/pricing';
