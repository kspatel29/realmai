
import { Coins } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SERVICE_CREDIT_COSTS } from '@/constants/pricing';

type ServiceCostDisplayProps = {
  showSummary?: boolean;
  cost?: number;
  label?: string;
}

const ServiceCostDisplay = ({ showSummary = true, cost, label }: ServiceCostDisplayProps) => {
  // If we have a specific cost to display, show that instead of the full pricing table
  if (cost !== undefined) {
    // Don't display anything if cost is 0 (typically when waiting for video upload)
    if (cost === 0) {
      return null;
    }
    
    return (
      <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-sm">
        <Coins className="h-3.5 w-3.5" />
        <span>{cost} {label || 'credits'}</span>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="pb-3 border-b bg-muted/10">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Service Credit Costs
        </CardTitle>
        {showSummary && (
          <CardDescription>
            Use this guide to estimate your credit needs
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-0 md:grid-cols-3">
          <div className="p-6 border-b md:border-b-0 md:border-r">
            <h4 className="font-medium mb-3 flex items-center text-blue-700">
              <span className="bg-blue-100 p-1.5 rounded-full mr-2">
                <Coins className="h-4 w-4 text-blue-600" />
              </span>
              Video Dubbing
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center p-2 rounded-md hover:bg-muted/20 transition-colors">
                <span className="text-muted-foreground">Standard:</span>
                <span className="font-medium">{SERVICE_CREDIT_COSTS.DUBBING.BASE_CREDITS_PER_MINUTE} credits/minute</span>
              </li>
              <li className="flex justify-between items-center p-2 rounded-md hover:bg-muted/20 transition-colors">
                <span className="text-muted-foreground">With Lip Sync:</span>
                <span className="font-medium">{SERVICE_CREDIT_COSTS.DUBBING.LIPSYNC_CREDITS_PER_MINUTE} credits/minute</span>
              </li>
            </ul>
          </div>
          <div className="p-6 border-b md:border-b-0 md:border-r">
            <h4 className="font-medium mb-3 flex items-center text-purple-700">
              <span className="bg-purple-100 p-1.5 rounded-full mr-2">
                <Coins className="h-4 w-4 text-purple-600" />
              </span>
              Subtitles
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center p-2 rounded-md hover:bg-muted/20 transition-colors">
                <span className="text-muted-foreground">Basic Model:</span>
                <span className="font-medium">{SERVICE_CREDIT_COSTS.SUBTITLES.BASE_CREDITS} credits/run</span>
              </li>
              <li className="flex justify-between items-center p-2 rounded-md hover:bg-muted/20 transition-colors">
                <span className="text-muted-foreground">Premium Model:</span>
                <span className="font-medium">{SERVICE_CREDIT_COSTS.SUBTITLES.PREMIUM_CREDITS} credits/run</span>
              </li>
            </ul>
          </div>
          <div className="p-6">
            <h4 className="font-medium mb-3 flex items-center text-amber-700">
              <span className="bg-amber-100 p-1.5 rounded-full mr-2">
                <Coins className="h-4 w-4 text-amber-600" />
              </span>
              Video Generation
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center p-2 rounded-md hover:bg-muted/20 transition-colors">
                <span className="text-muted-foreground">Per Second:</span>
                <span className="font-medium">{SERVICE_CREDIT_COSTS.VIDEO_GENERATION.CREDITS_PER_SECOND} credits</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCostDisplay;
