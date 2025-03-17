
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
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                <span className="text-youtube-red">Global Reach,</span> Greater Revenue
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-lg">
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
              <Link to="/signin">
                <Button variant="outline" className="h-12 px-6 font-medium text-lg" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold">J</div>
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold">M</div>
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold">P</div>
              </div>
              <span className="text-sm text-muted-foreground">
                Trusted by top creators worldwide
              </span>
            </div>
          </div>

          <div 
            className={`relative transition-all duration-1000 delay-500 transform ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="relative z-10 bg-white rounded-lg shadow-xl overflow-hidden hover-scale border border-gray-100">
              <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
                  <div className="w-16 h-16 rounded-full bg-youtube-red text-white flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 9V15L15 12L10 9Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                  <div>
                    <h3 className="font-medium">MrBeast</h3>
                    <p className="text-sm text-muted-foreground">12M+ views • 3 weeks ago</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-lg">How I Made $1M with Global Content</h3>
                  <p className="text-sm text-muted-foreground">
                    In this video, I explain how I increased my revenue by 350% using RealmAI to dub my content in 12 languages...
                  </p>
                </div>
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
