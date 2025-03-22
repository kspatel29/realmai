
import { Coins } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SERVICE_CREDIT_COSTS } from '@/constants/pricing';

type ServiceCostDisplayProps = {
  showSummary?: boolean;
}

const ServiceCostDisplay = ({ showSummary = true }: ServiceCostDisplayProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
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
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-muted/30 p-4">
            <h4 className="font-medium mb-2">Video Dubbing</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Standard:</span>
                <span>{SERVICE_CREDIT_COSTS.DUBBING.BASE_CREDITS_PER_MINUTE} credits/minute</span>
              </li>
              <li className="flex justify-between">
                <span>With Lip Sync:</span>
                <span>{SERVICE_CREDIT_COSTS.DUBBING.LIPSYNC_CREDITS_PER_MINUTE} credits/minute</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg bg-muted/30 p-4">
            <h4 className="font-medium mb-2">Subtitles</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Basic Model:</span>
                <span>{SERVICE_CREDIT_COSTS.SUBTITLES.BASE_CREDITS} credits/run</span>
              </li>
              <li className="flex justify-between">
                <span>Premium Model:</span>
                <span>{SERVICE_CREDIT_COSTS.SUBTITLES.PREMIUM_CREDITS} credits/run</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg bg-muted/30 p-4">
            <h4 className="font-medium mb-2">Video Generation</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Per Second:</span>
                <span>{SERVICE_CREDIT_COSTS.VIDEO_GENERATION.CREDITS_PER_SECOND} credits</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCostDisplay;
