import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A] to-[#0A0A0A]"></div>
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <Link to="/" className="inline-block mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ff5c5c]/10 to-[#ffb3b3]/10 rounded-full border border-white/10"
              >
                <img src="/dubgate.png" alt="Dubgate Logo" className="h-7 w-7 mr-2" />
                <span className="text-2xl font-bold bg-gradient-to-r from-[#ff5c5c] to-[#ffb3b3] bg-clip-text text-transparent">
                  Dubgate
                </span>
              </motion.div>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              AI-powered tools to help YouTubers expand globally, increase revenue, and save time with automatic dubbing, subtitles, and clips generation.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Youtube, href: "#" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {[
            {
              title: "Products",
              links: [
                "AI Dubbing",
                "Subtitle Generator",
                "Clips Engine",
                "Analytics"
              ]
            },
            {
              title: "Company",
              links: [
                "About Us",
                "Careers",
                "Blog",
                "Press",
                "Partners"
              ]
            },
            {
              title: "Support",
              links: [
                "Help Center",
                "Contact Us",
                "Privacy Policy",
                "Terms of Service",
                "Cookie Policy"
              ]
            }
          ].map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                <span className="bg-gradient-to-r from-[#ff5c5c] to-[#ffb3b3] bg-clip-text text-transparent">{section.title}</span>
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                  >
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-[#ff5c5c] transition-colors flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-[#ff5c5c] mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Dubgate. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link, index) => (
              <motion.a
                key={link}
                href="#"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-gray-400 hover:text-[#ff5c5c] text-sm transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
