
import React from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS } from "@/constants/pricing";

interface CurrentPlanProps {
  currentPlan: typeof SUBSCRIPTION_PLANS[0];
  onChangePlan: () => void;
}

const CurrentPlan = ({ currentPlan, onChangePlan }: CurrentPlanProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">{currentPlan?.name}</h3>
          <p className="text-sm text-muted-foreground">
            {currentPlan?.price !== null 
              ? `$${currentPlan?.price}/month • ${currentPlan?.creditsPerMonth} credits/month` 
              : 'Custom pricing'}
          </p>
        </div>
        <Button variant="outline" onClick={onChangePlan}>
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
    </div>
  );
};

export default CurrentPlan;
