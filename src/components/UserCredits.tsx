
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
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

  const handleCreditsClick = () => {
    navigate('/dashboard/billing');
  };

  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1 px-2"
              onClick={handleCreditsClick}
            >
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
            <p>View billing and credits</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default UserCredits;
