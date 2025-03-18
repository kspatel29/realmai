
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-b from-black to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-youtube-red/10 rounded-full filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-youtube-red/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div 
            className={`space-y-8 transition-all duration-1000 delay-300 transform ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-youtube-red/10 text-youtube-red rounded-full text-sm font-medium">
                Revenue Maximizer for YouTubers
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance text-white">
                <span className="text-youtube-red">Global Reach,</span> Greater Revenue
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mt-4 max-w-lg">
                AI-powered tools to dub, subtitle, and clip your content for international audiences. Your content, in any language, on autopilot.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button 
                  className="bg-youtube-red hover:bg-youtube-darkred h-12 px-6 text-white font-medium text-lg group"
                  size="lg"
                >
                  Start For Free
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white">J</div>
                <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white">M</div>
                <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white">P</div>
              </div>
              <span className="text-sm text-gray-400">
                Trusted by top creators worldwide
              </span>
            </div>
          </div>

          <div 
            className={`relative transition-all duration-1000 delay-500 transform ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            {/* Hero image with gradient glow */}
            <div className="relative flex justify-center items-center w-full">
              {/* Gradient glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-youtube-red/30 to-white/10 opacity-70 blur-xl rounded-2xl"></div>
              
              {/* Actual image with proper dimensions */}
              <div className="relative w-full h-[450px] mx-auto">
                <img 
                  src="/lovable-uploads/9074c80c-dd83-4590-876c-cf18a0366903.png" 
                  alt="YouTube creators collage" 
                  className="w-full h-full object-contain rounded-xl shadow-2xl"
                  style={{ 
                    maskImage: 'linear-gradient(to bottom, black 98%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 98%, transparent 100%)'
                  }}
                />
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-youtube-red/10 rounded-full filter blur-xl z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
