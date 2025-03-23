
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCredits } from '@/hooks/credits';
import { useNavigate } from 'react-router-dom';

const UserCredits = () => {
  const { credits, isLoading } = useCredits();
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  
  // Animation for credits change
  useEffect(() => {
    if (!isLoading) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [credits, isLoading]);

  const handleBuyMoreCredits = () => {
    navigate('/dashboard/billing');
  };

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <Badge 
                variant="outline" 
                className={`font-mono ${isAnimating ? 'animate-pulse bg-yellow-100' : ''}`}
              >
                {isLoading ? "..." : credits}
              </Badge>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Available credits</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleBuyMoreCredits}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Buy more credits</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default UserCredits;
