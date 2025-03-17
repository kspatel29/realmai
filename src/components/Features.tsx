
import { Globe, Video, MessageSquare, Scissors, BarChart, Zap } from "lucide-react";

const features = [
  {
    icon: <Globe className="h-10 w-10 text-youtube-red" />,
    title: "AI-Powered Dubbing",
    description: "Convert your videos into multiple languages with natural-sounding voice clones that maintain your unique tone and style.",
    delay: "100"
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-youtube-red" />,
    title: "Automatic Subtitles",
    description: "Generate accurate subtitles in 50+ languages with perfect timing and cultural nuances for global accessibility.",
    delay: "200"
  },
  {
    icon: <Scissors className="h-10 w-10 text-youtube-red" />,
    title: "Smart Clips Generator",
    description: "Automatically identify high-engagement moments and create viral clips optimized for each platform.",
    delay: "300"
  },
  {
    icon: <BarChart className="h-10 w-10 text-youtube-red" />,
    title: "Revenue Analytics",
    description: "Track performance across languages and platforms to see exactly how much additional revenue your global content generates.",
    delay: "400"
  },
  {
    icon: <Video className="h-10 w-10 text-youtube-red" />,
    title: "Multichannel Publishing",
    description: "Push your localized content directly to multiple YouTube channels with customized thumbnails and metadata.",
    delay: "500"
  },
  {
    icon: <Zap className="h-10 w-10 text-youtube-red" />,
    title: "One-Click Workflow",
    description: "Upload once and let our AI handle everything from dubbing to publishing, saving you countless hours of work.",
    delay: "600"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-youtube-red/10 text-youtube-red rounded-full text-sm font-medium mb-3">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Turn One Video Into a Global Content Empire
          </h2>
          <p className="text-lg text-muted-foreground">
            Our AI-powered tools help you break language barriers and multiply your revenue without extra work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              data-aos="fade-up"
              data-aos-delay={feature.delay}
            >
              <div className="mb-5 inline-block p-3 bg-gray-50 rounded-lg">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
