
import React from "react";
import { CheckCircle, Star, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLANS } from "@/constants/pricing";

interface EnhancedSubscriptionPlansProps {
  currentPlanId: string;
  onSelectPlan: (plan: typeof SUBSCRIPTION_PLANS[0]) => void;
  isLoading: boolean;
}

const EnhancedSubscriptionPlans = ({ currentPlanId, onSelectPlan, isLoading }: EnhancedSubscriptionPlansProps) => {
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'essentials':
        return <Star className="h-5 w-5 text-green-500" />;
      case 'creator-pro':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'studio-pro':
        return <Users className="h-5 w-5 text-orange-500" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getPlanBadge = (planId: string) => {
    switch (planId) {
      case 'essentials':
        return <Badge className="bg-green-100 text-green-700">Most Popular</Badge>;
      case 'creator-pro':
        return <Badge className="bg-purple-100 text-purple-700">Best Value</Badge>;
      case 'studio-pro':
        return <Badge className="bg-orange-100 text-orange-700">Enterprise</Badge>;
      default:
        return null;
    }
  };

  const getPlanBorder = (planId: string, currentPlanId: string) => {
    if (planId === currentPlanId) {
      return 'border-blue-500 bg-blue-50';
    }
    if (planId === 'essentials') {
      return 'border-green-200 hover:border-green-300';
    }
    if (planId === 'creator-pro') {
      return 'border-purple-200 hover:border-purple-300';
    }
    return 'border-gray-200 hover:border-gray-300';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the perfect plan for your content creation needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`transition-all duration-200 relative ${getPlanBorder(plan.id, currentPlanId)}`}
          >
            {plan.id === currentPlanId && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getPlanIcon(plan.id)}
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                {getPlanBadge(plan.id)}
              </div>
              
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">
                    {plan.price !== null ? `$${plan.price}` : 'Custom'}
                  </span>
                  {plan.price !== null && (
                    <span className="text-sm text-muted-foreground ml-1">/month</span>
                  )}
                </div>
                {plan.creditsPerMonth && (
                  <div className="text-sm text-muted-foreground">
                    {plan.creditsPerMonth} credits included
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-6">
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => onSelectPlan(plan)} 
                variant={plan.id === currentPlanId ? "outline" : "default"}
                className="w-full"
                disabled={plan.id === currentPlanId || isLoading}
              >
                {plan.id === currentPlanId 
                  ? 'Current Plan' 
                  : plan.price === null 
                    ? 'Contact Sales' 
                    : isLoading 
                      ? 'Processing...' 
                      : 'Select Plan'
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">All plans include:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• High-quality AI processing</li>
              <li>• 99.9% uptime guarantee</li>
              <li>• Secure file processing</li>
              <li>• Cancel anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSubscriptionPlans;
