import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { stripeService } from "@/services/api/stripeService";
import { toast } from "sonner";
import { CREDIT_PACKAGES, SUBSCRIPTION_PLANS } from "@/constants/pricing";

export const usePaymentIntents = (checkPaymentMethod: () => Promise<void>, fetchPaymentHistory: () => Promise<void>) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState<typeof CREDIT_PACKAGES[0] | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<{ clientSecret: string, id: string } | null>(null);
  const [setupIntent, setSetupIntent] = useState<{ clientSecret: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [elementsKey, setElementsKey] = useState<string>(`setup-intent-${Date.now()}`);

  // Check for return from checkout session
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (sessionId && success === 'true' && !isProcessingCheckout) {
      setIsProcessingCheckout(true);
      // Handle successful checkout
      stripeService.verifyCheckoutSession(sessionId)
        .then(result => {
          if (result.success) {
            toast.success(result.message || 'Payment completed successfully!');
            fetchPaymentHistory();
          } else {
            toast.error(result.message || 'Payment was not completed.');
          }
        })
        .catch(error => {
          console.error('Error processing checkout result:', error);
          toast.error('Failed to process payment confirmation.');
        })
        .finally(() => {
          // Clear URL parameters
          setSearchParams({});
          setIsProcessingCheckout(false);
        });
    } else if (canceled === 'true') {
      toast.info('Payment was canceled.');
      // Clear URL parameters
      setSearchParams({});
    }
  }, [searchParams, fetchPaymentHistory, isProcessingCheckout, setSearchParams]);

  const redirectToCheckout = async (url: string) => {
    if (!url) {
      toast.error("Invalid checkout URL");
      return;
    }
    
    // Open Stripe checkout in a new tab to avoid iframe restrictions
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
      toast.error("Please allow popups to complete your payment");
      return;
    }
    
    toast.success("Redirecting to Stripe Checkout in a new tab...");
  };

  const handleBuyCredits = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    if (!user) {
      toast.error("You must be logged in to purchase credits");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Creating checkout session for package:", pkg.id);
      
      const result = await stripeService.createCheckoutSession(
        user.id,
        'payment',
        {
          packageId: pkg.id,
          credits: pkg.credits,
          price: pkg.price
        }
      );
      
      if (result && result.url) {
        redirectToCheckout(result.url);
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      toast.error("Failed to initialize checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribeToPlan = async (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    if (!user) {
      toast.error("You must be logged in to subscribe");
      return;
    }
    
    // Skip for custom priced plans that require contacting sales
    if (plan.price === null) {
      toast.info("Please contact sales to subscribe to this plan");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Creating checkout session for plan:", plan.id);
      
      const result = await stripeService.createCheckoutSession(
        user.id,
        'subscription',
        {
          subscriptionPlanId: plan.id,
          price: plan.price
        }
      );
      
      if (result && result.url) {
        redirectToCheckout(result.url);
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      toast.error("Failed to initialize checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!user) {
      toast.error("You must be logged in to add a payment method");
      return false;
    }

    try {
      setIsLoading(true);
      console.log("Creating setup intent for user", user.id);
      const result = await stripeService.createSetupIntent(user.id);
      console.log("Setup intent created:", result);
      
      if (result && result.clientSecret) {
        setSetupIntent({
          clientSecret: result.clientSecret
        });
        setElementsKey(`setup-intent-${Date.now()}`);
        return true;
      } else {
        toast.error("Failed to create setup intent: Invalid response");
        return false;
      }
    } catch (err) {
      console.error("Error creating setup intent:", err);
      toast.error("Failed to initiate payment method setup. Please try again later.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentIntent(null);
    setSelectedPackage(null);
    toast.success("Payment successful! Credits have been added to your account.");
    fetchPaymentHistory();
  };

  const cancelPayment = () => {
    setPaymentIntent(null);
    setSelectedPackage(null);
  };

  const cancelPaymentMethodAddition = () => {
    setSetupIntent(null);
  };

  return {
    selectedPackage,
    paymentIntent,
    setupIntent,
    isLoading,
    elementsKey,
    handleBuyCredits,
    handleSubscribeToPlan,
    handleUpdatePayment,
    handlePaymentSuccess,
    cancelPayment,
    cancelPaymentMethodAddition,
    setSetupIntent,
  };
};
