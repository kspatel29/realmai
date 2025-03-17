
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  "No upfront costs - only pay when you generate revenue",
  "Reach viewers in 50+ languages with perfect translations",
  "Maintain your authentic voice and style in every language",
  "Create viral short-form content automatically",
  "Get detailed analytics on your global performance"
];

const CallToAction = () => {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block px-3 py-1 bg-youtube-red/10 text-youtube-red rounded-full text-sm font-medium">
                Start Growing Today
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Free to Start, <span className="text-youtube-red">Scale</span> as You Grow
              </h2>
              <p className="text-lg text-muted-foreground">
                Our revenue-share model means you only pay when our tools help you earn more. No risk, just growth.
              </p>

              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-youtube-red shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link to="/signup">
                  <Button 
                    className="bg-youtube-red hover:bg-youtube-darkred h-12 px-6 text-white font-medium text-lg group"
                    size="lg"
                  >
                    Get Started For Free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 border-t-4 border-youtube-red animate-float">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Revenue Share</h3>
                  <div className="flex items-baseline mt-1">
                    <span className="text-5xl font-bold">15%</span>
                    <span className="text-muted-foreground ml-2">of new revenue</span>
                  </div>
                </div>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>

              <p className="text-muted-foreground mb-6">
                Only pay a percentage of the additional revenue our tools help you generate. No new revenue? No cost.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span>Languages Supported</span>
                  <span className="font-medium">50+</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span>Dubbing Quality</span>
                  <span className="font-medium">Studio-Grade</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span>Clips Generation</span>
                  <span className="font-medium">Unlimited</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span>Analytics Dashboard</span>
                  <span className="font-medium">Comprehensive</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Support Level</span>
                  <span className="font-medium">Priority</span>
                </div>
              </div>

              <Link to="/signup" className="block">
                <Button 
                  className="w-full h-12 bg-youtube-red hover:bg-youtube-darkred text-white font-medium text-lg"
                  size="lg"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
