import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HERO_BG = "#111113";
const HERO_IMG_SIZE = 480; // px

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: HERO_BG }}>
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-12 py-16 px-4 pt-48">
        {/* Left: Text */}
        <div className="flex flex-col items-center text-center gap-6 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white drop-shadow-[0_4px_32px_rgba(255,92,92,0.5)] whitespace-nowrap"
          >
            Go Global. Go Viral.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl font-semibold mt-2 tracking-wider flex flex-wrap items-center gap-2"
          >
            <span className="font-extrabold text-white text-2xl md:text-3xl mr-1" style={{letterSpacing: '0.04em'}}>FOR</span>
            <span className="pastel-gradient-text italic font-extrabold text-2xl md:text-3xl whitespace-nowrap">
              DIRT CHEAP
            </span>
            <style>{`
              @keyframes pastel-gradient-move {
                0% { background-position: 0% 50%; }
                100% { background-position: 100% 50%; }
              }
              .pastel-gradient-text {
                background: linear-gradient(90deg, #ffb3b3, #ff5c5c, #ffb3b3 80%);
                background-size: 200% auto;
                background-clip: text;
                -webkit-background-clip: text;
                color: transparent;
                -webkit-text-fill-color: transparent;
                animation: pastel-gradient-move 2s linear infinite alternate;
                text-shadow: 0 0 8px #ffb3b388, 0 0 24px #ff5c5c44;
                padding-right: 0.1em;
              }
            `}</style>
          </motion.p>
          <Button className="mt-2 px-10 py-5 rounded-2xl bg-[#ff5c5c] text-white font-bold text-xl shadow-2xl transition-all duration-300 hover:bg-[#ffb3b3] hover:text-[#c92a2a] focus:bg-[#ffb3b3] focus:text-[#c92a2a] active:scale-100 hover:scale-105 focus:scale-105">
            Get Started
          </Button>
        </div>
        {/* Right: Image with morphing blurred background and gentle float */}
        <div className="flex items-center justify-center w-full relative min-h-[320px] mt-8">
          <div className="relative w-full max-w-2xl">
            {/* Morphing blurred orb background exactly behind the image */}
            <motion.div
              initial={{ scale: 1, borderRadius: "50%" }}
              animate={{
                scale: [1, 1.08, 1],
                borderRadius: ["50%", "42% 58% 60% 40% / 50% 40% 60% 50%", "50%"],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 z-0"
              style={{
                width: '100%',
                height: '100%',
                background: '#ffb3b3',
                opacity: 0.4,
                filter: 'blur(60px)',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            />
            {/* Floating hero image, larger, no border, fully visible */}
            <motion.img
              src="/realmAI-banner.png"
              alt="Dubgate Global Banner"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: [0, -24, 0] }}
              transition={{ opacity: { duration: 0.8, delay: 0.4 }, y: { duration: 7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 } }}
              className="w-full rounded-3xl object-cover z-10 shadow-2xl relative"
              style={{ background: HERO_BG, objectFit: 'cover', aspectRatio: '16/9' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
