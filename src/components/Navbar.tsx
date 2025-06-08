import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 py-6" style={{fontFamily: 'Inter, sans-serif'}}>
      <nav
        className={`w-full max-w-6xl mx-auto px-8 flex items-center justify-between transition-all duration-500 ${
          isScrolled
            ? 'bg-[#18181b] shadow-2xl'
            : 'bg-transparent shadow-none'
        } py-5 rounded-3xl`}
      >
        <Link to="/" className="flex items-center min-w-[120px] space-x-3">
          <img src="/dubgate.png" alt="Dubgate" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-extrabold tracking-wide text-white" style={{letterSpacing: '0.02em'}}>Dubgate</span>
        </Link>
        <div className="hidden md:flex items-center space-x-10">
          <a href="#features" className="text-white font-medium text-base tracking-wide transition-colors duration-200 hover:text-red-400 hover:font-semibold">Features</a>
          <a href="#testimonials" className="text-white font-medium text-base tracking-wide transition-colors duration-200 hover:text-red-400 hover:font-semibold">Impact</a>
          <a href="#pricing" className="text-white font-medium text-base tracking-wide transition-colors duration-200 hover:text-red-400 hover:font-semibold">Pricing</a>
          <Link to="/signin" className="text-white font-medium text-base hover:text-red-400 transition-colors duration-200 px-4">Sign In</Link>
          <Link to="/signup" className="px-7 py-2 rounded-2xl bg-[#ff5c5c] text-white font-bold shadow-md hover:opacity-90 transition-opacity duration-200">Get Started</Link>
        </div>
        <button
          className="md:hidden text-white hover:text-red-400"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-[#18181b] rounded-3xl shadow-2xl">
          <div className="px-6 py-6 flex flex-col space-y-4">
            <a href="#features" className="text-white font-medium text-lg py-2 transition-colors duration-200 hover:text-red-400 hover:font-semibold">Features</a>
            <a href="#testimonials" className="text-white font-medium text-lg py-2 transition-colors duration-200 hover:text-red-400 hover:font-semibold">Impact</a>
            <a href="#pricing" className="text-white font-medium text-lg py-2 transition-colors duration-200 hover:text-red-400 hover:font-semibold">Pricing</a>
            <Link to="/signin" className="text-white font-medium text-lg py-2 hover:text-red-400 transition-colors duration-200">Sign In</Link>
            <Link to="/signup" className="w-full bg-[#ff5c5c] text-white font-bold text-lg rounded-2xl shadow-md py-2 text-center hover:opacity-90 transition-opacity duration-200">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
