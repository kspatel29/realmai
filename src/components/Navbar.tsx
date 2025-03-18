
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-3" : "py-5"
      }`}
    >
      <nav 
        className={`transition-all duration-300 ease-in-out ${
          isScrolled 
            ? "container mx-auto max-w-5xl bg-black/80 backdrop-blur-md border border-gray-800/30 rounded-full px-6 py-2 shadow-lg" 
            : "container mx-auto px-6 bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-youtube-red">RealmAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <Link to="/" className="text-white hover-link font-medium">
                Home
              </Link>
              <a href="#features" className="text-white hover-link font-medium">
                Features
              </a>
              <a href="#testimonials" className="text-white hover-link font-medium">
                Testimonials
              </a>
              <a href="#pricing" className="text-white hover-link font-medium">
                Pricing
              </a>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/signin">
                <Button variant="ghost" className="font-medium text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-youtube-red hover:bg-youtube-darkred text-white font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              className="text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-black/90 backdrop-blur-md border border-gray-800/30 rounded-2xl shadow-lg animate-fade-in-up">
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-white py-2 hover:text-youtube-red transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <a 
              href="#features" 
              className="text-white py-2 hover:text-youtube-red transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#testimonials" 
              className="text-white py-2 hover:text-youtube-red transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Testimonials
            </a>
            <a 
              href="#pricing" 
              className="text-white py-2 hover:text-youtube-red transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="flex flex-col space-y-3 pt-3 border-t border-gray-800">
              <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full text-white border-gray-700 hover:bg-gray-800">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-youtube-red hover:bg-youtube-darkred text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
