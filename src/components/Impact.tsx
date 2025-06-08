import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const stats = [
  {
    value: "10x",
    label: "Revenue Growth",
    description: "Content creators see an average 10x increase in revenue after expanding to international markets."
  },
  {
    value: "50+",
    label: "Languages",
    description: "Reach global audiences with automatic translation and dubbing in over 50 languages."
  },
  {
    value: "85%",
    label: "Time Saved",
    description: "Reduce content localization time by 85% compared to traditional methods."
  }
];

const Impact = () => {
  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      <div className="container mx-auto px-6">
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
            <span className="text-sm font-medium bg-gradient-to-r from-[#ff5c5c] to-[#ffb3b3] bg-clip-text text-transparent">
              The Impact
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#ff5c5c] via-[#ffb3b3] to-[#ff5c5c] bg-clip-text text-transparent"
          >
            Transform Your Content Into a Global Empire
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-gray-400"
          >
            Join the creators who are already multiplying their revenue and reach with our AI-powered platform.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center relative"
            >
              <div className="absolute inset-0 z-0 rounded-2xl bg-gradient-to-r from-[#ff5c5c]/20 via-[#ffb3b3]/20 to-[#ff5c5c]/20 blur-2xl pointer-events-none" />
              <div className="relative z-10 p-6 rounded-2xl">
                <div className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#ff5c5c] via-[#ffb3b3] to-[#ff5c5c] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#ff5c5c] via-[#ffb3b3] to-[#ff5c5c] bg-clip-text text-transparent">
                  {stat.label}
                </h3>
                <p className="text-gray-400">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <a
            href="#contact"
            className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-[#ff5c5c] to-[#ffb3b3] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Start Growing Your Audience
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Impact; 