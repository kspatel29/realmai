
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { stripeService } from "@/services/api/stripeService";
import { toast } from "sonner";

export const useSubscriptionManagement = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const cancelSubscription = async () => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      await stripeService.cancelSubscription(user.id);
      toast.success("Subscription cancelled successfully. You'll retain access until your current billing period ends.");
      return true;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changeSubscriptionPlan = async (newPlanId: string) => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      await stripeService.changeSubscriptionPlan(user.id, newPlanId);
      toast.success("Subscription plan updated successfully");
      return true;
    } catch (error) {
      console.error("Error changing subscription plan:", error);
      toast.error("Failed to change subscription plan");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reactivateSubscription = async () => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      await stripeService.reactivateSubscription(user.id);
      toast.success("Subscription reactivated successfully");
      return true;
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast.error("Failed to reactivate subscription");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    cancelSubscription,
    changeSubscriptionPlan,
    reactivateSubscription,
  };
};
