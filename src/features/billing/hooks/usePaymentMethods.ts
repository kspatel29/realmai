
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { stripeService } from "@/services/api/stripeService";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export const usePaymentMethods = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const result = await stripeService.getPaymentMethods(user.id);
      setPaymentMethods(result.paymentMethods || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await stripeService.removePaymentMethod(user.id, paymentMethodId);
      toast.success("Payment method removed successfully");
      await fetchPaymentMethods();
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast.error("Failed to remove payment method");
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await stripeService.setDefaultPaymentMethod(user.id, paymentMethodId);
      toast.success("Default payment method updated");
      await fetchPaymentMethods();
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast.error("Failed to update default payment method");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  return {
    paymentMethods,
    isLoading,
    fetchPaymentMethods,
    removePaymentMethod,
    setDefaultPaymentMethod,
  };
};
