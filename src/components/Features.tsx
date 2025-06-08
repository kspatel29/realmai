import { Globe, Video, MessageSquare, Scissors, BarChart, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 0.5, 0.5, 0.3]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Dot properties
    const dots: { x: number; y: number; baseX: number; baseY: number; size: number; vx: number; vy: number }[] = [];
    const gridSize = 40;
    const dotSize = 1.5;
    const maxDistance = 150;
    const springStrength = 0.1;
    const friction = 0.8;

    // Create dots
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        dots.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: dotSize,
          vx: 0,
          vy: 0
        });
      }
    }

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      dots.forEach(dot => {
        // Calculate force
        if (mousePosition) {
          const dx = mousePosition.x - dot.x;
          const dy = mousePosition.y - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const angle = Math.atan2(dy, dx);
            const force = (maxDistance - distance) / maxDistance;
            dot.vx -= Math.cos(angle) * force * 0.5;
            dot.vy -= Math.sin(angle) * force * 0.5;
          }
        }

        // Spring force to return to base position
        const springX = (dot.baseX - dot.x) * springStrength;
        const springY = (dot.baseY - dot.y) * springStrength;
        dot.vx += springX;
        dot.vy += springY;

        // Apply friction
        dot.vx *= friction;
        dot.vy *= friction;

        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        
        // Set color based on distance
        if (mousePosition) {
          const dx = mousePosition.x - dot.x;
          const dy = mousePosition.y - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const intensity = (maxDistance - distance) / maxDistance;
            ctx.fillStyle = `rgba(255, 92, 92, ${intensity * 0.6})`;
          } else {
            ctx.fillStyle = 'rgba(79, 79, 79, 0.2)';
          }
        } else {
          ctx.fillStyle = 'rgba(79, 79, 79, 0.2)';
        }
        
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mousePosition]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setMousePosition(null);
  };

  return (
    <section 
      id="features" 
      className="py-24 bg-[#0A0A0A] relative overflow-hidden" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

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
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ff5c5c]/10 to-[#ffb3b3]/10 rounded-full border border-white/10 mb-4"
          >
            <span className="text-sm font-medium bg-gradient-to-r from-[#ff5c5c] to-[#ffb3b3] bg-clip-text text-transparent">
              Powerful Features
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#ff5c5c] via-[#ffb3b3] to-[#ff5c5c] bg-clip-text text-transparent"
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
              <motion.div 
                className="relative bg-[#0A0A0A] rounded-2xl p-8 border border-white/10 hover:border-[#ff5c5c]/50 transition-all duration-500"
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
              >
                <div className={`mb-6 inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} bg-clip-padding`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-500">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
