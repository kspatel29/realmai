
import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { stripeService } from "@/services/api/stripeService";
import { useAuth } from "@/hooks/useAuth";
import { CREDIT_PACKAGES } from "@/constants/pricing";

interface CheckoutFormProps {
  packageInfo: typeof CREDIT_PACKAGES[0];
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ packageInfo, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/billing`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        console.error("Payment error:", error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await stripeService.confirmCreditPurchase(paymentIntent.id);
        toast.success(`Successfully purchased ${packageInfo.credits} credits!`);
        onSuccess();
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      <PaymentElement />
      
      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? "Processing..." : `Pay $${packageInfo.price}`}
        </Button>
      </div>
    </form>
  );
};

export default CheckoutForm;
