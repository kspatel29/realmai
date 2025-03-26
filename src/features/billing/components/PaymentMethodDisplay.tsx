
import React from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentMethodDisplayProps {
  isLoading: boolean;
  onUpdatePayment: () => void;
}

const PaymentMethodDisplay = ({ isLoading, onUpdatePayment }: PaymentMethodDisplayProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-md shadow-sm">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <p className="font-medium">Payment Method</p>
          <p className="text-sm text-muted-foreground">Add a payment method to make purchases</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onUpdatePayment}
        disabled={isLoading}
      >
        Add Payment Method
      </Button>
    </div>
  );
};

export default PaymentMethodDisplay;
