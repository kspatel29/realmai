
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { Appearance, StripeElementsOptions } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = "pk_test_51QRqRsRuznwovkUGautChTNVygE1HbSKiUgJc4frQjLeDYFF6Mq5BIHfqau9ribQgRSq7XRnSCDDmyGejFdXiafp00H5h8vS27";

export const useStripeSetup = () => {
  const [stripePromise, setStripePromise] = useState(() => loadStripe(STRIPE_PUBLIC_KEY));
  const [stripeInitialized, setStripeInitialized] = useState(false);
  
  useEffect(() => {
    if (stripePromise) {
      console.log("Stripe initialization successful");
      setStripeInitialized(true);
    } else {
      console.error("Failed to initialize Stripe with key:", STRIPE_PUBLIC_KEY);
    }
  }, [stripePromise]);

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
