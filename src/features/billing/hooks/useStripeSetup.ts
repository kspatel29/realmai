
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { Appearance, StripeElementsOptions, Stripe } from '@stripe/stripe-js';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStripeSetup = () => {
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const [stripeInitialized, setStripeInitialized] = useState(false);
  
  useEffect(() => {
    const fetchStripeConfig = async () => {
      try {
        console.log("Fetching Stripe configuration...");
        const { data, error } = await supabase.functions.invoke('get-stripe-config');
        
        if (error) {
          console.error("Error retrieving Stripe configuration:", error);
          toast.error("Failed to load payment provider. Please try again later.");
          return;
        }
        
        if (!data || !data.publishableKey) {
          console.error("Invalid Stripe configuration response:", data);
          toast.error("Payment system misconfigured. Please contact support.");
          return;
        }
        
        console.log("Initializing Stripe with public key:", data.publishableKey.substring(0, 8) + "...");
        const stripeInstance = await loadStripe(data.publishableKey);
        
        if (stripeInstance) {
          setStripePromise(stripeInstance);
          setStripeInitialized(true);
          console.log("Stripe initialization successful");
        } else {
          console.error("Failed to initialize Stripe");
          toast.error("Failed to initialize payment provider. Please try again later.");
        }
      } catch (error) {
        console.error("Error setting up Stripe:", error);
        toast.error("Payment system error. Please try again later.");
      }
    };
    
    fetchStripeConfig();
  }, []);

  const getStripeElementsOptions = (clientSecret: string | null): StripeElementsOptions => {
    const appearance: Appearance = {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#10b981',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    };
    
    return {
      clientSecret: clientSecret || '',
      appearance,
      loader: 'auto',
    };
  };

  return {
    stripePromise,
    stripeInitialized,
    getStripeElementsOptions
  };
};
