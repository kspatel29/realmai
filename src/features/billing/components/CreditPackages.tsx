
import React from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CREDIT_PACKAGES } from "@/constants/pricing";

interface CreditPackagesProps {
  onSelectPackage: (pkg: typeof CREDIT_PACKAGES[0]) => void;
  isLoading: boolean;
}

const CreditPackages = ({ onSelectPackage, isLoading }: CreditPackagesProps) => {
  return (
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
              onClick={() => onSelectPackage(pkg)}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Purchase Now"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CreditPackages;
