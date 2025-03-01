import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function AuthNavbar() { 
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
          if (window.scrollY > lastScrollY) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          setLastScrollY(window.scrollY);
        };
    
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <nav 
            className={`fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-slate-900/50 border-b border-slate-700 transition-transform duration-300 ${
                isVisible ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link 
                    to="/" 
                    className="text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
                >
                    <span className="text-2xl">🚀</span>
                    CollabSpace
                </Link>

                {/* Auth Links */}
                <div className="flex items-center gap-4">
                    <Link 
                        to="/login"
                        className="px-6 py-3 text-indigo-400 border border-indigo-500 rounded-xl hover:bg-indigo-600/20 transition-colors duration-300"
                    >
                        Log In
                    </Link>
                    <Link
                        to="/signup" 
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-300"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default AuthNavbar;