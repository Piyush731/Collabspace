import React, { useState, useEffect }  from "react";
import { Link as ScrollLink } from "react-scroll"; // Import Scroll Link 
import { Link } from 'react-router-dom';

function Navbar() {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Detect scroll direction
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false); // Hide when scrolling down
      } else {
        setIsVisible(true); // Show when scrolling up
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`h-16 fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-slate-900/50 border-b border-slate-700 py-3 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
    <div className="container mx-auto px-6 py-2 flex justify-between items-center h-full">
      {/* Left Section - Logo */}
      <div className="flex items-center h-18">
        <ScrollLink
          to="Hero"
          smooth={true}
          duration={500}
          className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
        >
          CollabSpace
        </ScrollLink>
      </div>

      {/* Middle Section - Links */}
      <div className="hidden md:flex items-center space-x-4">
        <ScrollLink
          to="features"
          smooth={true}
          duration={500}
          spy={true}
          activeClass="text-indigo-400"
          className="text-gray-300 hover:text-indigo-400 cursor-pointer transition-colors"
        >
          Features
        </ScrollLink>
        <ScrollLink
          to="pricing"
          smooth={true}
          duration={500}
          spy={true}
          activeClass="text-indigo-400"
          className="text-gray-300 hover:text-indigo-400 cursor-pointer transition-colors"
        >
          Pricing
        </ScrollLink>
        <ScrollLink
          to="contact"
          smooth={true}
          duration={500}
          spy={true}
          activeClass="text-indigo-400"
          className="text-gray-300 hover:text-indigo-400 cursor-pointer transition-colors"
        >
          Contact
        </ScrollLink>
      </div>

      {/* Right Section - Buttons */}
      <div className="flex items-center space-x-4">
        <Link
          to="/login"
          className="px-4 py-2 text-indigo-400 border border-indigo-500 rounded-xl hover:bg-indigo-600/20 transition-colors"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  </nav>
);
}

export default Navbar;