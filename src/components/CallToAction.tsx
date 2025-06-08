import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Package, Coins, Sparkles } from "lucide-react";
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES, SERVICE_CREDIT_COSTS } from "@/constants/pricing";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const CallToAction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Animated canvas background (copied from Features)
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Dot properties
    const dots: { x: number; y: number; baseX: number; baseY: number; size: number; vx: number; vy: number }[] = [];
    const gridSize = 40;
    const dotSize = 1.5;
    const maxDistance = 150;
    const springStrength = 0.1;
    const friction = 0.8;

    // Create dots
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        dots.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: dotSize,
          vx: 0,
          vy: 0
        });
      }
    }

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(dot => {
        // Calculate force
        if (mousePosition) {
          const dx = mousePosition.x - dot.x;
          const dy = mousePosition.y - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxDistance) {
            const angle = Math.atan2(dy, dx);
            const force = (maxDistance - distance) / maxDistance;
            dot.vx -= Math.cos(angle) * force * 0.5;
            dot.vy -= Math.sin(angle) * force * 0.5;
          }
        }
        // Spring force to return to base position
        const springX = (dot.baseX - dot.x) * springStrength;
        const springY = (dot.baseY - dot.y) * springStrength;
        dot.vx += springX;
        dot.vy += springY;
        // Apply friction
        dot.vx *= friction;
        dot.vy *= friction;
        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;
        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        // Set color based on distance
        if (mousePosition) {
          const dx = mousePosition.x - dot.x;
          const dy = mousePosition.y - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxDistance) {
            const intensity = (maxDistance - distance) / maxDistance;
            ctx.fillStyle = `rgba(255, 92, 92, ${intensity * 0.6})`;
          } else {
            ctx.fillStyle = 'rgba(79, 79, 79, 0.2)';
          }
        } else {
          ctx.fillStyle = 'rgba(79, 79, 79, 0.2)';
        }
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mousePosition]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  const handleMouseLeave = () => {
    setMousePosition(null);
  };

  const handlePricingAction = () => {
    if (user) {
      navigate('/dashboard/billing');
    } else {
      navigate('/signup');
    }
  };

  return (
    <section id="pricing" className="pt-24 pb-16 bg-[#0A0A0A] relative overflow-hidden" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

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
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ff5c5c]/10 to-[#ffb3b3]/10 rounded-full border border-white/10 mb-4"
          >
            <Sparkles className="w-4 h-4 text-[#ff5c5c] mr-2" />
            <span className="text-sm font-medium bg-gradient-to-r from-[#ff5c5c] to-[#ffb3b3] bg-clip-text text-transparent">
              Pricing Plans
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#ff5c5c] via-[#ffb3b3] to-[#ff5c5c] bg-clip-text text-transparent"
          >
            Choose the Right Plan for Your Growth
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
              className={`relative group overflow-hidden rounded-2xl ${
                plan.id === 'creator-pro' ? 'md:scale-110 relative z-10' : ''
              }`}
            >
              {/* Diagonal ribbon for Most Popular */}
              {plan.id === 'creator-pro' && (
                <div className="absolute -left-8 top-6 z-20 w-40 transform -rotate-45 select-none pointer-events-none">
                  <div className="bg-[#ff5c5c] text-white text-xs font-bold py-2 text-center shadow-lg" style={{letterSpacing: '0.04em', borderRadius: '4px 4px 0 0'}}>
                    MOST POPULAR
                  </div>
                </div>
              )}
              <div className={`relative bg-[#0A0A0A] rounded-2xl overflow-hidden border transition-all duration-500 ${plan.id === 'creator-pro' ? 'border-[#ff5c5c]' : 'border-white/10 hover:border-white/20'}`}>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2 text-white text-center">{plan.name}</h3>
                  <div className="flex items-end mb-6 justify-center text-center">
                    <span className="text-4xl font-bold bg-gradient-to-r from-[#ff5c5c] via-[#ffb3b3] to-[#ff5c5c] bg-clip-text text-transparent">
                      {plan.price !== null ? `$${plan.price}` : "Custom"}
                    </span>
                    <span className="text-gray-400 ml-2">{plan.price !== null ? "per month" : ""}</span>
                  </div>
                  
                  {plan.creditsPerMonth && (
                    <div className="flex items-center justify-center bg-white/5 p-3 rounded-lg mb-6 text-center whitespace-nowrap gap-2">
                      <Coins className="h-5 w-5 text-yellow-400" />
                      <span className="text-base font-medium text-white">{plan.creditsPerMonth} credits/month</span>
                    </div>
                  )}
                  
                  <p className="text-gray-400 mb-6 text-center">
                    {plan.description}
                  </p>
                  
                  <Button 
                    className={`w-full h-12 font-semibold bg-white text-[#ff5c5c] border-0 shadow-md transition-all duration-300 hover:bg-[#ffeaea] hover:text-[#ff5c5c] focus:bg-[#ffeaea] focus:text-[#ff5c5c] active:bg-[#ffeaea] active:text-[#ff5c5c]`}
                    variant="default"
                    size="lg"
                    onClick={handlePricingAction}
                  >
                    <span className="relative z-10 flex items-center">
                      {plan.id === 'studio-pro' ? 'Contact Sales' : user ? 'Upgrade Plan' : 'Sign Up'}
                      <ArrowRight className="ml-2 h-4 w-4 text-[#ff5c5c]" />
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
            <Package className="h-6 w-6 text-[#ff5c5c]" />
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
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff5c5c]/20 via-[#ffb3b3]/20 to-[#ff5c5c]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-[#0A0A0A] rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
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
                    className="w-full h-12 font-semibold bg-white text-[#ff5c5c] border-0 shadow-md transition-all duration-300 hover:bg-[#ff5c5c] hover:text-white focus:bg-[#ff5c5c] focus:text-white active:bg-[#ff5c5c] active:text-white"
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
          <div className="relative bg-[#0A0A0A] rounded-xl p-8 max-w-4xl mx-auto border border-white/10 hover:border-white/20 transition-all duration-500">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2 text-white">Service Cost Breakdown</h3>
              <p className="text-gray-400">See exactly what your credits are worth</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="relative group">
                <div className="relative bg-[#111] rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all duration-500">
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
                <div className="relative bg-[#111] rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all duration-500">
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
                <div className="relative bg-[#111] rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all duration-500">
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
