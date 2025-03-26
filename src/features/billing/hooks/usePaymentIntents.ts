
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { stripeService } from "@/services/api/stripeService";
import { toast } from "sonner";
import { CREDIT_PACKAGES } from "@/constants/pricing";

export const usePaymentIntents = (checkPaymentMethod: () => Promise<void>, fetchPaymentHistory: () => Promise<void>) => {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<typeof CREDIT_PACKAGES[0] | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<{ clientSecret: string, id: string } | null>(null);
  const [setupIntent, setSetupIntent] = useState<{ clientSecret: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [elementsKey, setElementsKey] = useState<string>(`setup-intent-${Date.now()}`);

  const handleBuyCredits = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    if (!user) {
      toast.error("You must be logged in to purchase credits");
      return;
    }

    await checkPaymentMethod();
    
    const hasPaymentMethod = await stripeService.checkPaymentMethod(user.id)
      .then(result => result?.hasPaymentMethod || false)
      .catch(() => false);
    
    if (!hasPaymentMethod) {
      toast.error("Please add a payment method before making a purchase", {
        description: "You'll be redirected to add a payment method.",
        action: {
          label: "Add Payment Method",
          onClick: () => handleUpdatePayment(),
        },
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await stripeService.createPaymentIntent({
        packageId: pkg.id,
        amount: pkg.price,
        credits: pkg.credits,
        userId: user.id
      });
      
      setPaymentIntent({
        clientSecret: result.clientSecret,
        id: result.paymentIntentId
      });
      setSelectedPackage(pkg);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      toast.error("Failed to initiate payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!user) {
      toast.error("You must be logged in to add a payment method");
      return;
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
    handleUpdatePayment,
    handlePaymentSuccess,
    cancelPayment,
    cancelPaymentMethodAddition,
    setSetupIntent,
  };
};
