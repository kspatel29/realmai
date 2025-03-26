
import React, { useState } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SUBSCRIPTION_PLANS } from "@/constants/pricing";

interface ChangePlanFormProps {
  currentPlan: typeof SUBSCRIPTION_PLANS[0];
  selectedPlan: typeof SUBSCRIPTION_PLANS[0];
  onSuccess: () => void;
  onCancel: () => void;
}

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

export default ChangePlanForm;
