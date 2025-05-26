
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, CreditCard, Settings, History } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";
import { Elements } from "@stripe/react-stripe-js";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import PaymentMethodForm from "@/features/billing/components/PaymentMethodForm";
import ChangePlanForm from "@/features/billing/components/ChangePlanForm";
import CheckoutForm from "@/features/billing/components/CheckoutForm";
import CreditPackageSelection from "@/features/billing/components/CreditPackageSelection";
import EnhancedSubscriptionPlans from "@/features/billing/components/EnhancedSubscriptionPlans";
import CurrentPlan from "@/features/billing/components/CurrentPlan";
import EnhancedTransactionHistory from "@/features/billing/components/EnhancedTransactionHistory";
import PaymentMethodManager from "@/features/billing/components/PaymentMethodManager";
import { useStripeSetup } from "@/features/billing/hooks/useStripeSetup";
import { useBillingData } from "@/features/billing/hooks/useBillingData";
import { usePaymentIntents } from "@/features/billing/hooks/usePaymentIntents";

const Billing = () => {
  const { credits } = useCredits();
  const [searchParams] = useSearchParams();
  const { stripePromise, stripeInitialized, getStripeElementsOptions } = useStripeSetup();
  const { 
    transactions, 
    hasPaymentMethod, 
    isLoading, 
    activeTab, 
    setActiveTab,
    fetchPaymentHistory,
    checkPaymentMethod,
    currentPlan 
  } = useBillingData();
  
  const {
    selectedPackage,
    paymentIntent,
    setupIntent,
    elementsKey,
    handleBuyCredits,
    handleSubscribeToPlan,
    handleUpdatePayment,
    handlePaymentSuccess,
    cancelPayment,
    cancelPaymentMethodAddition,
    setSetupIntent
  } = usePaymentIntents(checkPaymentMethod, fetchPaymentHistory);

  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [autoPayment, setAutoPayment] = useState(true); // Mock state for auto-payment
  const [paymentMethods, setPaymentMethods] = useState([]); // Mock payment methods

  // Mock subscription status - in real app, this would come from user profile
  const isSubscribed = currentPlan?.id !== 'starter';

  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');
    
    if (success === 'true' && sessionId) {
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 5000);
    }
  }, [searchParams]);

  const handlePaymentMethodSuccess = () => {
    setSetupIntent(null);
    setIsPaymentMethodModalOpen(false);
    checkPaymentMethod();
  };

  const handleChangePlan = (plan: typeof currentPlan) => {
    if (plan?.price === null) {
      window.open('mailto:realmaidevs@gmail.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }
    handleSubscribeToPlan(plan);
  };

  const openPaymentMethodModal = async () => {
    const success = await handleUpdatePayment();
    if (success) {
      setIsPaymentMethodModalOpen(true);
    }
  };

  const handleRemovePaymentMethod = (id: string) => {
    // Mock implementation - in real app, this would call Stripe API
    console.log('Remove payment method:', id);
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    // Mock implementation - in real app, this would call Stripe API
    console.log('Set default payment method:', id);
  };

  const handleToggleAutoPayment = (enabled: boolean) => {
    setAutoPayment(enabled);
    // In real app, this would update user preferences
  };

  const handleDownloadReceipt = (transactionId: string) => {
    // Mock implementation - in real app, this would generate/download receipt
    console.log('Download receipt for transaction:', transactionId);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Billing & Credits</h1>
          <p className="text-muted-foreground">
            Manage your subscription, purchase credits, and view your billing history
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">{credits} credits available</span>
        </div>
      </div>

      {showSuccessAlert && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Payment successful! Your account has been updated.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="credits" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span>Credits</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Plans</span>
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Payment</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="space-y-6 mt-6">
          {paymentIntent && selectedPackage ? (
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Purchase</CardTitle>
                <CardDescription>
                  You're purchasing {selectedPackage.credits} credits for ${selectedPackage.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.clientSecret }}>
                  <CheckoutForm 
                    packageInfo={selectedPackage} 
                    onSuccess={handlePaymentSuccess} 
                    onCancel={cancelPayment}
                  />
                </Elements>
              </CardContent>
            </Card>
          ) : (
            <>
              <CreditPackageSelection 
                onSelectPackage={handleBuyCredits}
                isLoading={isLoading}
                isSubscribed={isSubscribed}
              />

              <Separator className="my-8" />

              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Service Cost Breakdown</h2>
                <ServiceCostDisplay showSummary={true} />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the {currentPlan?.name} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CurrentPlan currentPlan={currentPlan} onChangePlan={() => setIsChangePlanModalOpen(true)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>Select a plan that fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedSubscriptionPlans 
                currentPlanId={currentPlan?.id || 'starter'} 
                onSelectPlan={handleChangePlan}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Management</CardTitle>
              <CardDescription>Manage your payment methods and billing preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodManager
                paymentMethods={paymentMethods}
                autoPayment={autoPayment}
                onAddPaymentMethod={openPaymentMethodModal}
                onRemovePaymentMethod={handleRemovePaymentMethod}
                onSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
                onToggleAutoPayment={handleToggleAutoPayment}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <EnhancedTransactionHistory 
            transactions={transactions}
            isLoading={isLoading}
            onDownloadReceipt={handleDownloadReceipt}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isPaymentMethodModalOpen} onOpenChange={setIsPaymentMethodModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a payment method to make purchases and subscribe to plans
            </DialogDescription>
          </DialogHeader>
          {setupIntent && setupIntent.clientSecret && stripeInitialized && (
            <Elements 
              stripe={stripePromise} 
              options={getStripeElementsOptions(setupIntent.clientSecret)}
              key={elementsKey}
            >
              <PaymentMethodForm 
                onSuccess={handlePaymentMethodSuccess} 
                onCancel={() => setIsPaymentMethodModalOpen(false)}
              />
            </Elements>
          )}
          {(!setupIntent || !setupIntent.clientSecret || !stripeInitialized) && (
            <div className="p-4 text-center">
              <p className="text-red-500">Unable to load payment form. Please try again later.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
