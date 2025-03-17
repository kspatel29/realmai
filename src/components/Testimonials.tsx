
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Jimmy Donaldson",
    handle: "MrBeast",
    avatar: "/placeholder.svg",
    subscribers: "200M+",
    quote: "Since using RealmAI to dub my videos, I've seen a 287% increase in international viewers and over $1.2M in additional revenue last quarter alone.",
    rating: 5
  },
  {
    id: 2,
    name: "Mark Rober",
    handle: "MarkRober",
    avatar: "/placeholder.svg",
    subscribers: "25M+",
    quote: "The quality of the AI dubbing is incredible. My Spanish and Portuguese subscribers can't tell it's not actually me speaking. My international revenue has doubled.",
    rating: 5
  },
  {
    id: 3,
    name: "Emma Chamberlain",
    handle: "emma",
    avatar: "/placeholder.svg",
    subscribers: "11M+",
    quote: "The clips generator saves me so much time and actually finds moments that perform better than what my team would pick. Total game changer.",
    rating: 5
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
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-youtube-red/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-youtube-red/5 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-youtube-red/10 text-youtube-red rounded-full text-sm font-medium mb-3">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Creators Who Expanded Their Global Reach
          </h2>
          <p className="text-lg text-muted-foreground">
            See how top creators use RealmAI to grow their audience and revenue worldwide.
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
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden">
                            <img 
                              src={testimonial.avatar} 
                              alt={testimonial.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-youtube-red">@{testimonial.handle}</span>
                              <span className="text-sm text-muted-foreground">{testimonial.subscribers} subscribers</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${
                                i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
                        "{testimonial.quote}"
                      </blockquote>
                      
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-muted-foreground">
                          Using <span className="text-youtube-red font-medium">RealmAI</span> for dubbing, subtitles, and clips creation
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
                className="rounded-full h-12 w-12 border-gray-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === currentIndex ? "bg-youtube-red w-8" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextTestimonial}
                className="rounded-full h-12 w-12 border-gray-200"
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
