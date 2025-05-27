
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { stripeService } from "@/services/api/stripeService";
import { toast } from "sonner";
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES } from "@/constants/pricing";

export const useBillingData = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("credits");

  useEffect(() => {
    if (user) {
      if (activeTab === "history") {
        fetchPaymentHistory();
      } else if (activeTab === "subscription") {
        fetchUserSubscription();
        checkPaymentMethod();
      }
    }
  }, [user, activeTab]);

  // Auto-refresh subscription when user changes or component mounts
  useEffect(() => {
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const result = await stripeService.getPaymentHistory(user.id);
      setTransactions(result.transactions || []);
    } catch (err) {
      console.error("Error fetching payment history:", err);
      toast.error("Failed to load payment history");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const result = await stripeService.getUserSubscription(user.id);
      console.log("Fetched subscription:", result);
      setUserSubscription(result?.subscription || null);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      toast.error("Failed to load subscription details");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentMethod = async () => {
    if (!user) return;
    
    try {
      const result = await stripeService.checkPaymentMethod(user.id);
      console.log("Payment method check result:", result);
      setHasPaymentMethod(result?.hasPaymentMethod || false);
    } catch (err) {
      console.error("Error checking payment method:", err);
    }
  };

  const currentPlan = userSubscription 
    ? SUBSCRIPTION_PLANS.find(plan => plan.id === userSubscription.planId) 
    : SUBSCRIPTION_PLANS[0];

  return {
    transactions,
    userSubscription,
    hasPaymentMethod,
    isLoading,
    activeTab,
    setActiveTab,
    fetchPaymentHistory,
    fetchUserSubscription,
    checkPaymentMethod,
    currentPlan,
  };
};
