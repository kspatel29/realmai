
import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";

interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentMethodForm = ({ onSuccess, onCancel }: PaymentMethodFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  console.log("PaymentMethodForm rendered, stripe:", !!stripe, "elements:", !!elements);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe.js hasn't loaded yet");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      console.log("Confirming setup with elements");
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/billing`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        console.error("Payment method error:", result.error);
        setErrorMessage(result.error.message || "Failed to save payment method");
      } else {
        toast.success("Payment method added successfully!");
        onSuccess();
      }
    } catch (err) {
      console.error('Error adding payment method:', err);
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
      
      <div className="min-h-[200px] p-4 border rounded-md bg-white">
        <PaymentElement options={{
          layout: {
            type: 'tabs',
            defaultCollapsed: false,
          }
        }} />
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? "Processing..." : "Save Payment Method"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentMethodForm;
