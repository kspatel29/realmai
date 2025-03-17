
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, X } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "per month",
    description: "Perfect for creators just getting started with global content",
    features: [
      "10 minutes of video dubbing per month",
      "5 videos with subtitles generation",
      "3 automated clips per video",
      "Basic analytics dashboard",
      "Email support"
    ],
    limitations: [
      "No custom voice training",
      "Limited language options (10 languages)"
    ],
    cta: "Start Free Trial",
    highlight: false
  },
  {
    name: "Pro",
    price: "$79",
    period: "per month",
    description: "For growing creators expanding their international reach",
    features: [
      "30 minutes of video dubbing per month",
      "Unlimited subtitle generation",
      "10 automated clips per video",
      "Advanced analytics dashboard",
      "Priority support",
      "Custom voice training",
      "All 50+ languages supported"
    ],
    limitations: [],
    cta: "Start Free Trial",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "per month",
    description: "For established creators maximizing their global presence",
    features: [
      "Unlimited video dubbing",
      "Unlimited subtitle generation",
      "Unlimited clip generation",
      "Advanced analytics with revenue insights",
      "Dedicated account manager",
      "Custom voice training with fine-tuning",
      "All 50+ languages with dialect support"
    ],
    limitations: [],
    cta: "Contact Sales",
    highlight: false
  }
];

const CallToAction = () => {
  return (
    <section id="pricing" className="py-24 bg-gradient-accent">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-youtube-red/10 text-youtube-red rounded-full text-sm font-medium mb-3">
            Pricing Plans
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose the Right Plan for Your <span className="text-youtube-red">Growth</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            All plans start with a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                plan.highlight ? 'ring-2 ring-youtube-red scale-105 md:scale-110 relative z-10' : ''
              }`}
            >
              {plan.highlight && (
                <div className="bg-youtube-red text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-end mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
                <p className="text-muted-foreground mb-6">
                  {plan.description}
                </p>
                
                <Link to="/signup">
                  <Button 
                    className={`w-full h-12 ${plan.highlight ? 'bg-youtube-red hover:bg-youtube-darkred' : ''}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
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
                    
                    {plan.limitations.map((limitation, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <X className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
