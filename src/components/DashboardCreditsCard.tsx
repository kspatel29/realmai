
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCredits } from "@/hooks/credits";

const DashboardCreditsCard = () => {
  const navigate = useNavigate();
  const { credits } = useCredits();

  const handleBuyCredits = () => {
    navigate('/dashboard/billing?tab=credits');
  };

  const handleManageBilling = () => {
    navigate('/dashboard/billing?tab=subscription');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span>Need More Credits?</span>
        </CardTitle>
        <CardDescription>
          You currently have <span className="font-semibold text-purple-600">{credits}</span> credits remaining.
          Purchase more credits or manage your subscription to continue using our services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleBuyCredits}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Coins className="h-4 w-4 mr-2" />
          Buy Credits
        </Button>
        <Button 
          onClick={handleManageBilling}
          variant="outline" 
          className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Manage Billing
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardCreditsCard;
