import { Globe, Video, MessageSquare, Scissors, BarChart, Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Globe className="h-8 w-8" />,
    title: "AI-Powered Dubbing",
    description: "Convert your videos into multiple languages with natural-sounding voice clones that maintain your unique tone and style.",
    gradient: "from-blue-500 to-purple-500"
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "Automatic Subtitles",
    description: "Generate accurate subtitles in 50+ languages with perfect timing and cultural nuances for global accessibility.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: <Scissors className="h-8 w-8" />,
    title: "Smart Clips Generator",
    description: "Automatically identify high-engagement moments and create viral clips optimized for each platform.",
    gradient: "from-pink-500 to-orange-500"
  },
  {
    icon: <BarChart className="h-8 w-8" />,
    title: "Revenue Analytics",
    description: "Track performance across languages and platforms to see exactly how much additional revenue your global content generates.",
    gradient: "from-orange-500 to-yellow-500"
  },
  {
    icon: <Video className="h-8 w-8" />,
    title: "Multichannel Publishing",
    description: "Push your localized content directly to multiple YouTube channels with customized thumbnails and metadata.",
    gradient: "from-yellow-500 to-green-500"
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "One-Click Workflow",
    description: "Upload once and let our AI handle everything from dubbing to publishing, saving you countless hours of work.",
    gradient: "from-green-500 to-blue-500"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A] to-[#0A0A0A]"></div>
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
              Powerful Features
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Turn One Video Into a Global Content Empire
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-gray-400"
          >
            Our AI-powered tools help you break language barriers and multiply your revenue without extra work.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-[#0A0A0A] rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500">
                <div className={`mb-6 inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} bg-clip-padding`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-500">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-500">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
