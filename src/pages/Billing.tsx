import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, Package, Plus, History, CreditCard, Receipt, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";
import { CREDIT_PACKAGES, SUBSCRIPTION_PLANS } from "@/constants/pricing";
import { useAuth } from "@/hooks/useAuth";
import { stripeService } from "@/services/api/stripeService";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { Appearance, StripeElementsOptions } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
console.log("Stripe public key available:", !!STRIPE_PUBLIC_KEY);
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY || "");

interface CheckoutFormProps {
  packageInfo: typeof CREDIT_PACKAGES[0];
  onSuccess: () => void;
  onCancel: () => void;
}

interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ChangePlanFormProps {
  currentPlan: typeof SUBSCRIPTION_PLANS[0];
  selectedPlan: typeof SUBSCRIPTION_PLANS[0];
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

const ChangePlanForm = ({ currentPlan, selectedPlan, onSuccess, onCancel }: ChangePlanFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Successfully changed to ${selectedPlan.name} plan!`);
      onSuccess();
    } catch (error) {
      toast.error("Failed to change plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between p-4 border rounded-md bg-gray-50">
        <div>
          <p className="font-medium">{currentPlan.name}</p>
          <p className="text-sm text-muted-foreground">Current Plan</p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400" />
        <div>
          <p className="font-medium">{selectedPlan.name}</p>
          <p className="text-sm text-muted-foreground">New Plan</p>
        </div>
      </div>
      
      <div className="border rounded-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Plan Details</h3>
          <div className="bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded text-sm">
            {selectedPlan.price !== null ? `$${selectedPlan.price}/month` : 'Custom pricing'}
          </div>
        </div>
        <ul className="space-y-2">
          {selectedPlan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="bg-green-100 p-1 rounded-full mt-0.5">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="submit" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Confirm Plan Change"}
        </Button>
      </div>
    </form>
  );
};

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

const Billing = () => {
  const { user } = useAuth();
  const { credits, addCredits } = useCredits();
  const [activeTab, setActiveTab] = useState("credits");
  const [selectedPackage, setSelectedPackage] = useState<typeof CREDIT_PACKAGES[0] | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<{ clientSecret: string, id: string } | null>(null);
  const [setupIntent, setSetupIntent] = useState<{ clientSecret: string } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [selectedPlanForChange, setSelectedPlanForChange] = useState<typeof SUBSCRIPTION_PLANS[0] | null>(null);
  const [stripeElementsInitialized, setStripeElementsInitialized] = useState(false);

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

  useEffect(() => {
    if (setupIntent) {
      console.log("New setup intent received, resetting elements initialized flag");
      setStripeElementsInitialized(false);
    }
  }, [setupIntent]);

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

  const handleBuyCredits = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    if (!user) {
      toast.error("You must be logged in to purchase credits");
      return;
    }

    await checkPaymentMethod();
    
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

  const handleChangePlan = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    setSelectedPlanForChange(plan);
    setIsChangePlanModalOpen(true);
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
        setIsPaymentMethodModalOpen(true);
      } else {
        toast.error("Failed to create setup intent: Invalid response");
      }
    } catch (err) {
      console.error("Error creating setup intent:", err);
      toast.error("Failed to initiate payment method setup. Please try again later.");
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

  const handlePaymentMethodSuccess = () => {
    setSetupIntent(null);
    setIsPaymentMethodModalOpen(false);
    setHasPaymentMethod(true);
    toast.success("Payment method added successfully!");
    fetchUserSubscription();
  };

  const handleChangePlanSuccess = () => {
    setIsChangePlanModalOpen(false);
    setSelectedPlanForChange(null);
    fetchUserSubscription();
  };

  const cancelPayment = () => {
    setPaymentIntent(null);
    setSelectedPackage(null);
  };

  const cancelPaymentMethodAddition = () => {
    setSetupIntent(null);
    setIsPaymentMethodModalOpen(false);
  };

  const cancelPlanChange = () => {
    setIsChangePlanModalOpen(false);
    setSelectedPlanForChange(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const currentPlan = userSubscription 
    ? SUBSCRIPTION_PLANS.find(plan => plan.id === userSubscription.planId) 
    : SUBSCRIPTION_PLANS[0];

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

  const stripeElementsOptions: StripeElementsOptions = setupIntent ? {
    clientSecret: setupIntent.clientSecret,
    appearance,
    loader: 'auto',
  } : {
    clientSecret: '',
    appearance,
    loader: 'auto',
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
            <Receipt className="h-4 w-4" />
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
                <Elements stripe={stripePromise} options={stripeElementsOptions}>
                  <PaymentMethodForm 
                    onSuccess={handlePaymentMethodSuccess} 
                    onCancel={cancelPaymentMethodAddition}
                  />
                </Elements>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <Card key={pkg.id} className="border border-muted hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-medium">{pkg.name}</CardTitle>
                      <div className="bg-yellow-100 text-yellow-700 font-medium px-2 py-1 rounded text-sm">
                        ${pkg.price}
                      </div>
                    </div>
                    <CardDescription className="text-center">{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Coins className="h-5 w-5 text-yellow-500 mr-1.5" />
                        <span className="text-2xl font-bold">{pkg.credits}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${(pkg.price / pkg.credits * 100).toFixed(1)}¢ per credit
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleBuyCredits(pkg)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Purchase Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">{currentPlan?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan?.price !== null ? `$${currentPlan?.price}/month • ${currentPlan?.creditsPerMonth} credits/month` : 'Custom pricing'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (currentPlan) setIsChangePlanModalOpen(true);
                  }}
                >
                  Change Plan
                </Button>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Plan Features:</h4>
                <ul className="space-y-2">
                  {currentPlan?.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="bg-green-100 p-1 rounded-full mt-0.5">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>Select a plan that fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div key={plan.id} className={`border rounded-lg p-4 ${plan.id === currentPlan?.id ? 'bg-gray-50 border-blue-200' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{plan.name}</h3>
                      {plan.id === currentPlan?.id && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Current</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                    <div className="mb-3">
                      <span className="text-lg font-bold">{plan.price !== null ? `$${plan.price}` : 'Custom'}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                    <ul className="text-sm space-y-1 mb-4">
                      {plan.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handleChangePlan(plan)} 
                      variant={plan.id === currentPlan?.id ? "outline" : "default"}
                      className="w-full"
                      disabled={plan.id === currentPlan?.id || plan.price === null /* can't select 'contact sales' plans */}
                    >
                      {plan.id === currentPlan?.id ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    {hasPaymentMethod ? (
                      <>
                        <p className="font-medium">Payment method on file</p>
                        <p className="text-sm text-muted-foreground">Credit card ending in ****</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">No payment method</p>
                        <p className="text-sm text-muted-foreground">Add a payment method to make purchases</p>
                      </>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUpdatePayment}
                  disabled={isLoading}
                >
                  {hasPaymentMethod ? "Update" : "Add"}
                </Button>
              </div>
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
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading transaction history...</div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No transaction history yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Description</th>
                        <th className="pb-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b">
                          <td className="py-3">{formatDate(tx.created_at)}</td>
                          <td className="py-3 capitalize">{tx.type}</td>
                          <td className="py-3">{tx.description}</td>
                          <td className="py-3">
                            <div className="flex items-center">
                              <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className={tx.type === 'purchase' ? 'text-green-600' : ''}>
                                {tx.type === 'purchase' ? '+' : '-'}{tx.amount}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
          {setupIntent && setupIntent.clientSecret && (
            <Elements 
              stripe={stripePromise} 
              options={stripeElementsOptions}
              key={setupIntent.clientSecret}
            >
              <PaymentMethodForm 
                onSuccess={handlePaymentMethodSuccess} 
                onCancel={cancelPaymentMethodAddition}
              />
            </Elements>
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

