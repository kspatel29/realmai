import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, CreditCard } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";
import { SUBSCRIPTION_PLANS } from "@/constants/pricing";
import { Elements } from "@stripe/react-stripe-js";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import PaymentMethodForm from "@/features/billing/components/PaymentMethodForm";
import ChangePlanForm from "@/features/billing/components/ChangePlanForm";
import CheckoutForm from "@/features/billing/components/CheckoutForm";
import CreditPackages from "@/features/billing/components/CreditPackages";
import SubscriptionPlans from "@/features/billing/components/SubscriptionPlans";
import CurrentPlan from "@/features/billing/components/CurrentPlan";
import TransactionHistory from "@/features/billing/components/TransactionHistory";
import PaymentMethodDisplay from "@/features/billing/components/PaymentMethodDisplay";
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
  const [selectedPlanForChange, setSelectedPlanForChange] = useState<typeof SUBSCRIPTION_PLANS[0] | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
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

  const handleChangePlan = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    if (plan.price === null) {
      window.open('mailto:sales@yourdomain.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }
    handleSubscribeToPlan(plan);
  };

  const handleChangePlanSuccess = () => {
    setIsChangePlanModalOpen(false);
    setSelectedPlanForChange(null);
  };

  const cancelPlanChange = () => {
    setIsChangePlanModalOpen(false);
    setSelectedPlanForChange(null);
  };

  const openPaymentMethodModal = async () => {
    const success = await handleUpdatePayment();
    if (success) {
      setIsPaymentMethodModalOpen(true);
    }
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
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span>Buy Credits</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
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
          ) : setupIntent && isPaymentMethodModalOpen ? (
            <Card>
              <CardHeader>
                <CardTitle>Add Payment Method</CardTitle>
                <CardDescription>
                  Add a payment method to make purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={getStripeElementsOptions(setupIntent.clientSecret)}>
                  <PaymentMethodForm 
                    onSuccess={handlePaymentMethodSuccess} 
                    onCancel={cancelPaymentMethodAddition}
                  />
                </Elements>
              </CardContent>
            </Card>
          ) : (
            <CreditPackages 
              onSelectPackage={handleBuyCredits}
              isLoading={isLoading}
            />
          )}

          <Separator className="my-8" />

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Service Cost Breakdown</h2>
            <ServiceCostDisplay showSummary={true} />
          </div>
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
              <SubscriptionPlans 
                currentPlanId={currentPlan?.id} 
                onSelectPlan={handleChangePlan} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodDisplay 
                hasPaymentMethod={hasPaymentMethod}
                isLoading={isLoading}
                onUpdatePayment={openPaymentMethodModal}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionHistory 
                transactions={transactions}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
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

      <Dialog open={isChangePlanModalOpen} onOpenChange={setIsChangePlanModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              You're changing from {currentPlan?.name} to {selectedPlanForChange?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedPlanForChange && currentPlan && (
            <ChangePlanForm
              currentPlan={currentPlan} 
              selectedPlan={selectedPlanForChange}
              onSuccess={handleChangePlanSuccess} 
              onCancel={cancelPlanChange}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
