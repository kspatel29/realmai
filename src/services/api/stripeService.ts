
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

export const stripeService = {
  // Create a payment intent for purchasing credits
  createPaymentIntent: async (purchase: CreditPackagePurchase): Promise<PaymentIntentResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { 
          purchase 
        }
      });
      
      if (error) throw new Error(error.message);
      if (!data || !data.clientSecret || !data.paymentIntentId) {
        throw new Error("Invalid response from payment service");
      }
      
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },
  
  // Create a setup intent for adding a payment method
  createSetupIntent: async (userId: string): Promise<SetupIntentResponse> => {
    try {
      console.log("Invoking create-setup-intent function with userId:", userId);
      const { data, error } = await supabase.functions.invoke('create-setup-intent', {
        body: { 
          userId 
        }
      });
      
      if (error) {
        console.error("Setup intent error response:", error);
        throw new Error(error.message);
      }
      
      if (!data || !data.clientSecret) {
        console.error("Invalid setup intent response:", data);
        throw new Error("Invalid response from payment service");
      }
      
      console.log("Setup intent created successfully");
      return data;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  },
  
  // Check if user has a payment method
  checkPaymentMethod: async (userId: string): Promise<{ hasPaymentMethod: boolean }> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-payment-method', {
        body: { 
          userId 
        }
      });
      
      if (error) {
        console.error("Error checking payment method:", error);
        return { hasPaymentMethod: false };
      }
      
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
