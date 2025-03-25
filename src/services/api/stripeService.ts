
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interface for payment intent response
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// Interface for setup intent response
export interface SetupIntentResponse {
  clientSecret: string;
}

// Interface for credit package purchase
export interface CreditPackagePurchase {
  packageId: string;
  amount: number;
  credits: number;
  userId: string;
}

// Interface for duration-based cost calculation
export interface DurationCostParams {
  durationMinutes?: number;
  durationSeconds?: number;
  service: "dubbing" | "subtitles" | "video_generation";
  enableLipSync?: boolean;
  isPremiumModel?: boolean;
  languages?: string[];
}

export const stripeService = {
  // Create a payment intent for purchasing credits
  createPaymentIntent: async (purchase: CreditPackagePurchase): Promise<PaymentIntentResponse> => {
    try {
      console.log("Creating payment intent for purchase:", purchase);
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { 
          purchase 
        }
      });
      
      if (error) {
        console.error("Payment intent error response:", error);
        throw new Error(error.message);
      }
      
      if (!data || !data.clientSecret || !data.paymentIntentId) {
        console.error("Invalid payment intent response:", data);
        throw new Error("Invalid response from payment service");
      }
      
      console.log("Payment intent created successfully:", { 
        paymentIntentId: data.paymentIntentId,
        clientSecretLength: data.clientSecret ? data.clientSecret.length : 0
      });
      
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },
  
  // Calculate cost based on file duration and service type
  calculateCostFromDuration: async (params: DurationCostParams): Promise<number> => {
    try {
      console.log("Calculating cost from duration:", params);
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('calculate-costs', {
        body: params
      });
      
      const duration = Date.now() - startTime;
      console.log(`Cost calculation responded in ${duration}ms`);
      
      if (error) {
        console.error("Cost calculation error:", error);
        throw new Error(error.message);
      }
      
      if (!data || typeof data.creditCost !== 'number') {
        console.error("Invalid cost calculation response:", data);
        throw new Error("Invalid response from cost calculation service");
      }
      
      console.log("Cost calculation result:", data);
      return data.creditCost;
    } catch (error) {
      console.error('Error calculating cost from duration:', error);
      
      // Fallback calculations if the edge function fails
      const { CREDIT_CONVERSION_RATE, SERVICE_PRICING } = await import("@/constants/pricing");
      const PROFIT_MULTIPLIER = 2;
      
      if (params.service === "dubbing" && params.durationMinutes) {
        const baseRatePerMinute = params.enableLipSync 
          ? SERVICE_PRICING.DUBBING.LIPSYNC_PRICE_PER_MINUTE 
          : SERVICE_PRICING.DUBBING.BASE_PRICE_PER_MINUTE;
        
        const languageCount = params.languages?.length || 1;
        const costUSD = baseRatePerMinute * params.durationMinutes * languageCount;
        return Math.ceil(costUSD * PROFIT_MULTIPLIER * CREDIT_CONVERSION_RATE);
      } 
      else if (params.service === "subtitles") {
        const baseRate = SERVICE_PRICING.SUBTITLES.PRICE_PER_RUN;
        const costUSD = params.isPremiumModel ? baseRate * 1.5 : baseRate;
        return Math.ceil(costUSD * PROFIT_MULTIPLIER * CREDIT_CONVERSION_RATE);
      } 
      else if (params.service === "video_generation" && params.durationSeconds) {
        const costUSD = SERVICE_PRICING.VIDEO_GENERATION.PRICE_PER_SECOND * params.durationSeconds;
        return Math.ceil(costUSD * PROFIT_MULTIPLIER * CREDIT_CONVERSION_RATE);
      }
      
      return 0;
    }
  },
  
  // Create a setup intent for adding a payment method
  createSetupIntent: async (userId: string): Promise<SetupIntentResponse> => {
    try {
      console.log("Invoking create-setup-intent function with userId:", userId);
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('create-setup-intent', {
        body: { 
          userId 
        }
      });
      
      const duration = Date.now() - startTime;
      console.log(`Setup intent function responded in ${duration}ms`);
      
      if (error) {
        console.error("Setup intent error response:", error);
        throw new Error(error.message);
      }
      
      if (!data) {
        console.error("Empty setup intent response");
        throw new Error("Empty response from payment service");
      }
      
      if (!data.clientSecret) {
        console.error("Invalid setup intent response (missing client secret):", data);
        throw new Error("Invalid response from payment service: missing client secret");
      }
      
      console.log("Setup intent response:", {
        clientSecret: data.clientSecret ? `${data.clientSecret.substring(0, 10)}...` : "missing",
        clientSecretLength: data.clientSecret ? data.clientSecret.length : 0
      });
      
      return {
        clientSecret: data.clientSecret
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  },
  
  // Check if user has a payment method
  checkPaymentMethod: async (userId: string): Promise<{ hasPaymentMethod: boolean }> => {
    try {
      console.log("Checking payment method for user:", userId);
      const { data, error } = await supabase.functions.invoke('check-payment-method', {
        body: { 
          userId 
        }
      });
      
      if (error) {
        console.error("Error checking payment method:", error);
        return { hasPaymentMethod: false };
      }
      
      console.log("Payment method check result:", data);
      return data || { hasPaymentMethod: false };
    } catch (error) {
      console.error('Error checking payment method:', error);
      // Return a default value to avoid breaking the UI
      return { hasPaymentMethod: false };
    }
  },
  
  // Confirm a credit purchase after successful payment
  confirmCreditPurchase: async (paymentIntentId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-credit-purchase', {
        body: { 
          paymentIntentId 
        }
      });
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Error confirming credit purchase:', error);
      throw error;
    }
  },
  
  // Get user subscription details
  getUserSubscription: async (userId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-subscription', {
        body: { 
          userId 
        }
      });
      
      if (error) {
        console.error("Error getting subscription:", error);
        // Return a default subscription to avoid breaking the UI
        return {
          subscription: {
            planId: "starter",
            status: "active"
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      // Return a default value to avoid breaking the UI
      return {
        subscription: {
          planId: "starter",
          status: "active"
        }
      };
    }
  },
  
  // Get user payment history
  getPaymentHistory: async (userId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-payment-history', {
        body: { 
          userId 
        }
      });
      
      if (error) {
        console.error("Error getting payment history:", error);
        return { transactions: [] };
      }
      
      return data || { transactions: [] };
    } catch (error) {
      console.error('Error getting payment history:', error);
      // Return a default value to avoid breaking the UI
      return { transactions: [] };
    }
  }
};
