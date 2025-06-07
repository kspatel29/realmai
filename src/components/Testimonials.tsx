import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink, TrendingUp, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Potential Growth",
    title: "International Audience Expansion",
    quote: "Content creators who translate their videos into just 5 additional languages can reach over 70% of the global internet audience, according to viewstats.com.",
    stat: "+200%",
    statLabel: "potential reach",
    icon: <TrendingUp className="h-6 w-6" />
  },
  {
    id: 2,
    name: "Market Analysis",
    title: "Multilingual Revenue Potential",
    quote: "Studies from viewstats.com show that videos with localized content in multiple languages can generate up to 45% more engagement from international viewers.",
    stat: "+45%",
    statLabel: "engagement",
    icon: <Users className="h-6 w-6" />
  },
  {
    id: 3,
    name: "Engagement Metrics",
    title: "Audience Retention",
    quote: "According to global content research by viewstats.com, videos with native-language subtitles have 40% higher retention rates from non-English speaking viewers.",
    stat: "40%",
    statLabel: "higher retention",
    icon: <Clock className="h-6 w-6" />
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-[#0A0A0A]">
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
            <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Market Insights
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            The Impact of Global Content Strategy
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-gray-400"
          >
            Real statistics that showcase how multilingual content can transform your channel's reach and revenue.
          </motion.p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-[#0A0A0A] rounded-2xl p-8 md:p-10 border border-white/10 hover:border-white/20 transition-all duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                          <div className="text-white">
                            {testimonials[currentIndex].icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-white">{testimonials[currentIndex].name}</h3>
                          <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-medium">
                            {testimonials[currentIndex].title}
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="block text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                          {testimonials[currentIndex].stat}
                        </span>
                        <span className="text-sm text-gray-400">{testimonials[currentIndex].statLabel}</span>
                      </div>
                    </div>
                    
                    <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-8 text-gray-300">
                      "{testimonials[currentIndex].quote}"
                    </blockquote>
                    
                    <div className="pt-4 border-t border-white/10">
                      <p className="flex items-center justify-end text-sm text-gray-400">
                        <span>Source: Industry statistics and market research</span>
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prevTestimonial}
                className="rounded-full h-12 w-12 border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-500"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-3 rounded-full transition-all duration-500 ${
                      i === currentIndex 
                        ? "w-8 bg-gradient-to-r from-blue-500 to-purple-500" 
                        : "w-3 bg-white/10 hover:bg-white/20"
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextTestimonial}
                className="rounded-full h-12 w-12 border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-500"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
