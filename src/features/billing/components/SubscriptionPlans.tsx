
import React from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS } from "@/constants/pricing";

interface SubscriptionPlansProps {
  currentPlanId: string;
  onSelectPlan: (plan: typeof SUBSCRIPTION_PLANS[0]) => void;
}

const SubscriptionPlans = ({ currentPlanId, onSelectPlan }: SubscriptionPlansProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {SUBSCRIPTION_PLANS.map((plan) => (
        <div key={plan.id} className={`border rounded-lg p-4 ${plan.id === currentPlanId ? 'bg-gray-50 border-blue-200' : ''}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{plan.name}</h3>
            {plan.id === currentPlanId && (
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
            onClick={() => onSelectPlan(plan)} 
            variant={plan.id === currentPlanId ? "outline" : "default"}
            className="w-full"
            disabled={plan.id === currentPlanId || plan.price === null /* can't select 'contact sales' plans */}
          >
            {plan.id === currentPlanId ? 'Current Plan' : 'Select Plan'}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionPlans;
