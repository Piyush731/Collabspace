import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const UserNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const handleScroll = () => {
    if (typeof window !== "undefined") {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest(".profile-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <motion.nav
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-slate-900/50 border-b
       border-slate-700 h-16 py-2  "
    >
      <div className="max-w-7xl mx-auto px-6 py-2 h-12 flex items-center justify-between">
        {/* Left Section: Sidebar Toggle Button and CollabSpace Link */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={`text-gray-300 hover:text-white text-2xl transition-transform duration-300 ${
              isSidebarOpen ? "translate-x-64 hidden" : "translate-x-0 block" 
            }`}
          >
            <i className="bi bi-list"></i>
          </button>

          {/* CollabSpace Link */}
          <Link
            to="/dashboard"
            className={`text-2xl font-bold text-white hover:text-blue-500 transition-colors ${
              isSidebarOpen ? "hidden" : "block"
            }`}
          >
            CollabSpace
          </Link>
        </div>

        {/* Right Section: Search Box, Icons, and Profile Dropdown */}
        <div className="flex items-center space-x-6">
          {/* Search Box */}
          <div className="hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-48 px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Icons */}
          <div className="flex space-x-4">
            <Link
              to="/git-pull"
              className="text-gray-300 hover:text-white transition-colors"
              data-tooltip="Pull Requests"
            >
              <i className="bi bi-git text-xl"></i>
            </Link>
            <Link
              to="/issues"
              className="text-gray-300 hover:text-white transition-colors"
              data-tooltip="Issues"
            >
              <i className="bi bi-exclamation-circle text-xl"></i>
            </Link>
            <Link
              to="/notifications"
              className="text-gray-300 hover:text-white transition-colors"
              data-tooltip="Notifications"
            >
              <i className="bi bi-bell text-xl"></i>
            </Link>
          </div>

          {/* Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <i className="bi bi-person-circle text-2xl"></i>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg"
                >
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/contact"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                    >
                      Help
                    </Link>
                    <button
                      onClick={
                        () => {
                          logout(); // Call logout function
                          navigate("/login");}
                      }
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                    >
                      Logout
                    </button> 
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default UserNavbar;