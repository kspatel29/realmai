
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Coins } from 'lucide-react';

interface CreditConfirmDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  serviceName: string;
  creditCost: number;
  onConfirm: () => void;
  description?: string;
}

const CreditConfirmDialog = ({
  open,
  setOpen,
  serviceName,
  creditCost,
  onConfirm,
  description,
}: CreditConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Confirm Credit Usage
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || `This action will use ${creditCost} credits from your account for the ${serviceName} service.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="p-4 border rounded-md bg-yellow-50 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{serviceName}</p>
              <p className="text-sm text-muted-foreground">Service Fee</p>
            </div>
            <div className="flex items-center gap-1 font-bold">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span>{creditCost}</span>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm and Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreditConfirmDialog;
