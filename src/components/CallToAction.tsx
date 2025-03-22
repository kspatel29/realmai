
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, X } from "lucide-react";
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES } from "@/constants/pricing";

const CallToAction = () => {
  return (
    <section id="pricing" className="py-24 bg-gradient-cta">
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
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <div 
              key={plan.id} 
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                plan.id === 'creator' ? 'ring-2 ring-youtube-red scale-105 md:scale-110 relative z-10' : ''
              }`}
            >
              {plan.id === 'creator' && (
                <div className="bg-youtube-red text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-end mb-4">
                  <span className="text-4xl font-bold">{plan.price !== null ? `$${plan.price}` : "Custom"}</span>
                  <span className="text-muted-foreground ml-2">{plan.price !== null ? "per month" : ""}</span>
                </div>
                <p className="text-muted-foreground mb-6">
                  {plan.description}
                </p>
                
                <Link to="/signup">
                  <Button 
                    className={`w-full h-12 ${plan.id === 'creator' ? 'bg-youtube-red hover:bg-youtube-darkred' : ''}`}
                    variant={plan.id === 'creator' ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.id === 'enterprise' ? 'Contact Sales' : 'Sign Up'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
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

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Creator Access Packs</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Need more credits without a subscription? Purchase credit packs to use anytime.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {CREDIT_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="glass-card rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-bold mb-2">{pkg.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                <div className="text-3xl font-bold mb-2">{pkg.credits}</div>
                <div className="text-youtube-red font-medium mb-4">${pkg.price}</div>
                <Link to="/signup">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 bg-muted/30 rounded-xl p-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Service Cost Breakdown</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-background p-4">
              <h4 className="font-medium mb-2">Video Dubbing</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Standard:</span>
                  <span>16 credits/minute</span>
                </li>
                <li className="flex justify-between">
                  <span>With Lip Sync:</span>
                  <span>32 credits/minute</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-background p-4">
              <h4 className="font-medium mb-2">Subtitles</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Basic Model:</span>
                  <span>4 credits/run</span>
                </li>
                <li className="flex justify-between">
                  <span>Premium Model:</span>
                  <span>10 credits/run</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-background p-4">
              <h4 className="font-medium mb-2">Video Generation</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Per Second:</span>
                  <span>14 credits</span>
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
