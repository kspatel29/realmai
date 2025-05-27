
import React from "react";
import { Coins, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CREDIT_PACKAGES } from "@/constants/pricing";

interface CreditPackageSelectionProps {
  onSelectPackage: (pkg: typeof CREDIT_PACKAGES[0]) => void;
  isLoading: boolean;
  isSubscribed: boolean;
}

const CreditPackageSelection = ({ onSelectPackage, isLoading, isSubscribed }: CreditPackageSelectionProps) => {
  const getPopularBadge = (packageId: string) => {
    return packageId === 'large' ? (
      <Badge className="absolute -top-2 right-4 bg-orange-500 text-white">
        <Star className="h-3 w-3 mr-1" />
        Most Popular
      </Badge>
    ) : null;
  };

  const getBestValueBadge = (packageId: string) => {
    return packageId === 'xl' ? (
      <Badge className="absolute -top-2 right-4 bg-green-500 text-white">
        Best Value
      </Badge>
    ) : null;
  };

  if (!isSubscribed) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <Coins className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Subscription Required</h3>
        <p className="text-muted-foreground mb-4">
          You need an active subscription to purchase additional credit packages.
        </p>
        <p className="text-sm text-muted-foreground">
          Please upgrade to a paid plan to access credit purchasing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Purchase Additional Credits</h2>
        <p className="text-muted-foreground">
          Boost your account with extra credits for more AI services
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card key={pkg.id} className="border border-muted hover:shadow-md transition-all relative">
            {getPopularBadge(pkg.id)}
            {getBestValueBadge(pkg.id)}
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium">{pkg.name}</CardTitle>
                <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-lg">
                  ${pkg.price}
                </div>
              </div>
              <CardDescription className="text-sm">{pkg.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-4">
              <div className="flex items-center justify-center mb-4 p-4 bg-yellow-50 rounded-lg">
                <Coins className="h-6 w-6 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold text-yellow-700">{pkg.credits}</span>
                <span className="text-sm text-yellow-600 ml-1">credits</span>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-xs text-green-600 font-medium">
                  {pkg.credits / 15} hours of content processing*
                </div>
              </div>
              
              <Button 
                className="w-full"
                onClick={() => onSelectPackage(pkg)}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? "Processing..." : "Purchase Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center text-xs text-muted-foreground">
        * Estimated processing time based on average service usage
      </div>
    </div>
  );
};

export default CreditPackageSelection;
