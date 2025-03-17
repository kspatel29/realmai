
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, ExternalLink } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Potential Growth",
    title: "International Audience Expansion",
    quote: "Content creators who translate their videos into just 5 additional languages can reach over 70% of the global internet audience, according to viewstats.com.",
    stat: "+200%",
    statLabel: "potential reach"
  },
  {
    id: 2,
    name: "Revenue Impact",
    title: "Multilingual Revenue Boost",
    quote: "Creators who localize content see an average 45% increase in ad revenue from international markets within the first 3 months, based on YouTube partner program statistics.",
    stat: "+45%",
    statLabel: "ad revenue"
  },
  {
    id: 3,
    name: "Engagement Metrics",
    title: "Audience Engagement",
    quote: "Videos with native-language subtitles have 40% higher retention rates and significantly more comments from non-English speaking viewers.",
    stat: "40%",
    statLabel: "higher retention"
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
    <section id="testimonials" className="py-24 relative overflow-hidden bg-gradient-subtle">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-youtube-red/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-youtube-red/5 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-youtube-red/10 text-youtube-red rounded-full text-sm font-medium mb-3">
            Growth Potential
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Impact of Global Content Strategy
          </h2>
          <p className="text-lg text-muted-foreground">
            Real statistics that showcase how multilingual content can transform your channel's reach and revenue.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <div className="glass-card rounded-2xl p-8 md:p-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                          <p className="text-youtube-red font-medium">{testimonial.title}</p>
                        </div>
                        <div className="text-center">
                          <span className="block text-4xl font-bold text-youtube-red">{testimonial.stat}</span>
                          <span className="text-sm text-muted-foreground">{testimonial.statLabel}</span>
                        </div>
                      </div>
                      
                      <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
                        "{testimonial.quote}"
                      </blockquote>
                      
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="flex items-center justify-end text-sm text-muted-foreground">
                          <span>Source: Industry statistics and market research</span>
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prevTestimonial}
                className="rounded-full h-12 w-12 border-gray-200 dark:border-gray-800"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === currentIndex ? "bg-youtube-red w-8" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextTestimonial}
                className="rounded-full h-12 w-12 border-gray-200 dark:border-gray-800"
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
