
import React, { useState } from "react";
import { CreditCard, Plus, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface PaymentMethodManagerProps {
  paymentMethods: PaymentMethod[];
  autoPayment: boolean;
  onAddPaymentMethod: () => void;
  onRemovePaymentMethod: (id: string) => void;
  onSetDefaultPaymentMethod: (id: string) => void;
  onToggleAutoPayment: (enabled: boolean) => void;
  isLoading: boolean;
}

const PaymentMethodManager = ({
  paymentMethods,
  autoPayment,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefaultPaymentMethod,
  onToggleAutoPayment,
  isLoading
}: PaymentMethodManagerProps) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (methodToDelete) {
      onRemovePaymentMethod(methodToDelete);
      setMethodToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const getCardIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return '💳';
    if (brandLower.includes('mastercard')) return '💳';
    if (brandLower.includes('amex')) return '💳';
    return '💳';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">
            Manage your payment methods and billing preferences
          </p>
        </div>
        <Button onClick={onAddPaymentMethod} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Auto-payment Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Auto-payment</CardTitle>
          <CardDescription>
            Automatically charge your default payment method for subscription renewals and credit purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-payment"
              checked={autoPayment}
              onCheckedChange={onToggleAutoPayment}
              disabled={isLoading}
            />
            <Label htmlFor="auto-payment">
              Enable automatic payments
            </Label>
          </div>
          {autoPayment && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Auto-payment is enabled. Your subscription will renew automatically.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h4 className="font-medium mb-2">No payment methods</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Add a payment method to make purchases and manage subscriptions
              </p>
              <Button onClick={onAddPaymentMethod} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getCardIcon(method.brand)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {method.brand.toUpperCase()} •••• {method.last4}
                        </span>
                        {method.isDefault && (
                          <Badge className="bg-blue-100 text-blue-700">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSetDefaultPaymentMethod(method.id)}
                        disabled={isLoading}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMethodToDelete(method.id);
                        setDeleteConfirmOpen(true);
                      }}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodManager;
