
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Package, Coins } from "lucide-react";
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES, SERVICE_CREDIT_COSTS } from "@/constants/pricing";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePricingAction = () => {
    if (user) {
      navigate('/dashboard/billing');
    } else {
      navigate('/signup');
    }
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-youtube-red/10 text-youtube-red rounded-full text-sm font-medium mb-3">
            Pricing Plans
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose the Right Plan for Your <span className="text-youtube-red">Growth</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every account starts with free credits. Upgrade anytime as your needs grow.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`rounded-2xl overflow-hidden border shadow-lg bg-white transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] ${
                plan.id === 'creator-pro' ? 'ring-2 ring-youtube-red scale-105 md:scale-110 relative z-10' : ''
              }`}
            >
              {plan.id === 'creator-pro' && (
                <div className="bg-youtube-red text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold">{plan.price !== null ? `$${plan.price}` : "Custom"}</span>
                  <span className="text-muted-foreground ml-2">{plan.price !== null ? "per month" : ""}</span>
                </div>
                
                {plan.creditsPerMonth && (
                  <div className="flex items-center justify-center gap-2 bg-gray-50 p-3 rounded-lg mb-6">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-medium">{plan.creditsPerMonth} credits monthly</span>
                  </div>
                )}
                
                <p className="text-muted-foreground mb-6 text-center">
                  {plan.description}
                </p>
                
                <Button 
                  className={`w-full h-12 ${plan.id === 'creator-pro' ? 'bg-youtube-red hover:bg-youtube-darkred' : ''}`}
                  variant={plan.id === 'creator-pro' ? 'default' : 'outline'}
                  size="lg"
                  onClick={handlePricingAction}
                >
                  {plan.id === 'studio-pro' ? 'Contact Sales' : user ? 'Upgrade Plan' : 'Sign Up'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="mt-8 space-y-4">
                  <p className="font-medium">What's included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-6 w-6 text-purple-500" />
            <h3 className="text-2xl font-bold">Creator Access Packs</h3>
          </div>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Need more credits without a subscription? Purchase credit packs to use anytime.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {CREDIT_PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                className="rounded-xl p-6 hover:shadow-lg transition-all duration-300 border bg-white hover:translate-y-[-4px]"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xl font-bold">{pkg.name}</h4>
                  <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-medium">
                    ${pkg.price}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 text-center">{pkg.description}</p>
                <div className="flex items-center justify-center mb-4">
                  <Coins className="h-5 w-5 text-yellow-500 mr-2" />
                  <div className="text-3xl font-bold">{pkg.credits}</div>
                </div>
                <div className="text-xs text-muted-foreground mb-4 text-center">
                  ${(pkg.price / pkg.credits * 100).toFixed(1)}¢ per credit
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handlePricingAction}
                >
                  {user ? 'Buy Credits' : 'Get Started'}
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-20 bg-white rounded-xl p-8 max-w-4xl mx-auto shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold mb-2">Service Cost Breakdown</h3>
            <p className="text-muted-foreground">See exactly what your credits are worth</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-5 border border-blue-100">
              <h4 className="font-medium mb-3 flex items-center text-blue-700">
                <Coins className="h-4 w-4 text-blue-600 mr-2" />
                Video Dubbing
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b border-blue-100 pb-2">
                  <span>Standard:</span>
                  <span className="font-semibold">{SERVICE_CREDIT_COSTS.DUBBING.BASE_CREDITS_PER_MINUTE} credits/minute</span>
                </li>
                <li className="flex justify-between">
                  <span>With Lip Sync:</span>
                  <span className="font-semibold">{SERVICE_CREDIT_COSTS.DUBBING.LIPSYNC_CREDITS_PER_MINUTE} credits/minute</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-purple-50 p-5 border border-purple-100">
              <h4 className="font-medium mb-3 flex items-center text-purple-700">
                <Coins className="h-4 w-4 text-purple-600 mr-2" />
                Subtitles
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b border-purple-100 pb-2">
                  <span>Basic Model:</span>
                  <span className="font-semibold">{SERVICE_CREDIT_COSTS.SUBTITLES.BASE_CREDITS} credits/run</span>
                </li>
                <li className="flex justify-between">
                  <span>Premium Model:</span>
                  <span className="font-semibold">{SERVICE_CREDIT_COSTS.SUBTITLES.PREMIUM_CREDITS} credits/run</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-amber-50 p-5 border border-amber-100">
              <h4 className="font-medium mb-3 flex items-center text-amber-700">
                <Coins className="h-4 w-4 text-amber-600 mr-2" />
                Video Generation
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span>Per Second:</span>
                  <span className="font-semibold">{SERVICE_CREDIT_COSTS.VIDEO_GENERATION.CREDITS_PER_SECOND} credits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
