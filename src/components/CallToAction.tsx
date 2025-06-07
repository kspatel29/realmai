import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Package, Coins, Sparkles } from "lucide-react";
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES, SERVICE_CREDIT_COSTS } from "@/constants/pricing";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
    <section id="pricing" className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A] to-[#0A0A0A]"></div>
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-white/10 mb-4"
          >
            <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Pricing Plans
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Choose the Right Plan for Your{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Growth
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-gray-400"
          >
            Every account starts with free credits. Upgrade anytime as your needs grow.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group ${
                plan.id === 'creator-pro' ? 'md:scale-110 relative z-10' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-[#0A0A0A] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500">
                {plan.id === 'creator-pro' && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                  <div className="flex items-end mb-6">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {plan.price !== null ? `$${plan.price}` : "Custom"}
                    </span>
                    <span className="text-gray-400 ml-2">{plan.price !== null ? "per month" : ""}</span>
                  </div>
                  
                  {plan.creditsPerMonth && (
                    <div className="flex items-center justify-center gap-2 bg-white/5 p-3 rounded-lg mb-6">
                      <Coins className="h-5 w-5 text-yellow-400" />
                      <span className="text-lg font-medium text-white">{plan.creditsPerMonth} credits monthly</span>
                    </div>
                  )}
                  
                  <p className="text-gray-400 mb-6 text-center">
                    {plan.description}
                  </p>
                  
                  <Button 
                    className={`w-full h-12 ${
                      plan.id === 'creator-pro' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    variant={plan.id === 'creator-pro' ? 'default' : 'outline'}
                    size="lg"
                    onClick={handlePricingAction}
                  >
                    <span className="relative z-10 flex items-center">
                      {plan.id === 'studio-pro' ? 'Contact Sales' : user ? 'Upgrade Plan' : 'Sign Up'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Button>
                  
                  <div className="mt-8 space-y-4">
                    <p className="font-medium text-white">What's included:</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-6 w-6 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">Creator Access Packs</h3>
          </div>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Need more credits without a subscription? Purchase credit packs to use anytime.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {CREDIT_PACKAGES.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-[#0A0A0A] rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-bold text-white">{pkg.name}</h4>
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 px-2 py-1 rounded text-sm font-medium">
                      ${pkg.price}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3 text-center">{pkg.description}</p>
                  <div className="flex items-center justify-center mb-4">
                    <Coins className="h-5 w-5 text-yellow-400 mr-2" />
                    <div className="text-3xl font-bold text-white">{pkg.credits}</div>
                  </div>
                  <div className="text-xs text-gray-400 mb-4 text-center">
                    ${(pkg.price / pkg.credits * 100).toFixed(1)}¢ per credit
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                    onClick={handlePricingAction}
                  >
                    {user ? 'Buy Credits' : 'Get Started'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-[#0A0A0A] rounded-xl p-8 max-w-4xl mx-auto border border-white/10 hover:border-white/20 transition-all duration-500">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2 text-white">Service Cost Breakdown</h3>
              <p className="text-gray-400">See exactly what your credits are worth</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-[#0A0A0A] rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all duration-500">
                  <h4 className="font-medium mb-3 flex items-center text-blue-400">
                    <Coins className="h-4 w-4 text-blue-400 mr-2" />
                    Video Dubbing
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-gray-400">Standard:</span>
                      <span className="font-semibold text-white">{SERVICE_CREDIT_COSTS.DUBBING.BASE_CREDITS_PER_MINUTE} credits/minute</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">With Lip Sync:</span>
                      <span className="font-semibold text-white">{SERVICE_CREDIT_COSTS.DUBBING.LIPSYNC_CREDITS_PER_MINUTE} credits/minute</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-[#0A0A0A] rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all duration-500">
                  <h4 className="font-medium mb-3 flex items-center text-purple-400">
                    <Coins className="h-4 w-4 text-purple-400 mr-2" />
                    Subtitles
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-gray-400">Basic Model:</span>
                      <span className="font-semibold text-white">{SERVICE_CREDIT_COSTS.SUBTITLES.BASE_CREDITS} credits/run</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Premium Model:</span>
                      <span className="font-semibold text-white">{SERVICE_CREDIT_COSTS.SUBTITLES.PREMIUM_CREDITS} credits/run</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-[#0A0A0A] rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all duration-500">
                  <h4 className="font-medium mb-3 flex items-center text-pink-400">
                    <Coins className="h-4 w-4 text-pink-400 mr-2" />
                    Video Generation
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-400">Per Second:</span>
                      <span className="font-semibold text-white">{SERVICE_CREDIT_COSTS.VIDEO_GENERATION.CREDITS_PER_SECOND} credits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
