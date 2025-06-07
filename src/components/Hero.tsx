import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#0A0A0A]">
      {/* Animated background grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A] to-[#0A0A0A]"></div>
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 z-0">
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

      <div className="container mx-auto px-6 py-12 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-white/10"
              >
                <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Next-Gen Content Optimization
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance"
              >
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Transform Your Content
                </span>
                <br />
                <span className="text-white">For Global Success</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-lg md:text-xl text-gray-400 mt-6 max-w-lg leading-relaxed"
              >
                AI-powered tools to dub, subtitle, and clip your content for international audiences. Your content, in any language, on autopilot.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/signup">
                <Button 
                  className="relative group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-12 px-8 text-white font-medium text-lg overflow-hidden"
                  size="lg"
                >
                  <span className="relative z-10 flex items-center">
                    Start For Free
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex items-center space-x-4 pt-4"
            >
              <div className="flex -space-x-3">
                {["J", "M", "P"].map((letter, index) => (
                  <motion.div
                    key={letter}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-lg"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
              <span className="text-sm text-gray-400">
                Trusted by top creators worldwide
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="relative"
          >
            <div className="relative flex justify-center items-center w-full">
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-70 blur-2xl rounded-3xl"></div>
              
              {/* Main image with modern styling */}
              <div className="relative w-full h-[500px] mx-auto">
                <img 
                  src="/lovable-uploads/9074c80c-dd83-4590-876c-cf18a0366903.png" 
                  alt="YouTube creators collage" 
                  className="w-full h-full object-contain rounded-2xl shadow-2xl"
                  style={{ 
                    maskImage: 'linear-gradient(to bottom, black 98%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 98%, transparent 100%)'
                  }}
                />
                
                {/* Floating elements */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg flex items-center justify-center"
                >
                  <span className="text-white font-bold">AI</span>
                </motion.div>
                
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center"
                >
                  <span className="text-white font-bold">ML</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
