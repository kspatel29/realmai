
import React, { useState } from "react";
import { AlertTriangle, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSubscriptionManagement } from "@/features/billing/hooks/useSubscriptionManagement";
import { SUBSCRIPTION_PLANS } from "@/constants/pricing";

interface SubscriptionManagementProps {
  currentPlan: any;
  onPlanChange?: () => void;
}

const SubscriptionManagement = ({ currentPlan, onPlanChange }: SubscriptionManagementProps) => {
  const { isLoading, cancelSubscription, changeSubscriptionPlan } = useSubscriptionManagement();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleCancelSubscription = async () => {
    const success = await cancelSubscription();
    if (success) {
      setCancelDialogOpen(false);
      onPlanChange?.();
    }
  };

  const handleChangePlan = async (planId: string) => {
    const success = await changeSubscriptionPlan(planId);
    if (success) {
      setChangePlanDialogOpen(false);
      onPlanChange?.();
    }
  };

  const availablePlans = SUBSCRIPTION_PLANS.filter(plan => plan.id !== currentPlan?.id && plan.id !== 'starter');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            Manage your current subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">{currentPlan?.name}</h4>
              <p className="text-sm text-muted-foreground">
                {currentPlan?.price ? `$${currentPlan.price}/month` : 'Free plan'}
              </p>
            </div>
            <div className="flex gap-2">
              {currentPlan?.id !== 'starter' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChangePlanDialogOpen(true)}
                    disabled={isLoading}
                  >
                    Change Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={isLoading}
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
            </div>
          </div>

          {currentPlan?.id !== 'starter' && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Your subscription will renew automatically. You can cancel anytime and retain access until your billing period ends.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll retain access to premium features until your current billing period ends.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                After cancellation:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>You'll keep access until your billing period ends</li>
                  <li>You'll be downgraded to the Starter plan</li>
                  <li>Your credits will be preserved</li>
                  <li>You can reactivate anytime</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                {isLoading ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a new plan. Changes will be prorated and take effect immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`cursor-pointer transition-colors ${
                  selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="font-bold">
                      {plan.price ? `$${plan.price}/month` : 'Contact Sales'}
                    </div>
                    <ul className="text-xs space-y-1">
                      {plan.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <span className="text-green-500">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setChangePlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedPlan && handleChangePlan(selectedPlan)}
              disabled={!selectedPlan || isLoading}
            >
              {isLoading ? "Updating..." : "Change Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManagement;
