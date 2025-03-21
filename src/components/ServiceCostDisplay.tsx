
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ServiceCostDisplayProps {
  cost: number;
  label?: string;
  showLabel?: boolean;
}

const ServiceCostDisplay = ({ cost, label = 'Cost', showLabel = true }: ServiceCostDisplayProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {showLabel && <span className="text-sm text-muted-foreground">{label}:</span>}
            <Badge variant="outline" className="bg-yellow-50">
              <Coins className="h-3 w-3 text-yellow-500 mr-1" />
              <span>{cost}</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>This service costs {cost} credits</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ServiceCostDisplay;
