import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const sidebarVariants = {
  open: { x: 0, opacity: 1 },
  closed: { x: "-100%", opacity: 0 }
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const links = [
    { path: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    { path: "/repositories", icon: "bi-folder", label: "Repositories" },
    { path: "/tasks", icon: "bi-list-check", label: "Tasks" },
    { path: "/reports", icon: "bi-bar-chart", label: "Reports" },
    { path: "/settings", icon: "bi-gear", label: "Settings" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          variants={sidebarVariants}
          initial="closed"
          animate="open"
          exit="closed"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 h-screen w-64 backdrop-blur-lg bg-slate-900/50 border-b
       border-slate-700 shadow-xl z-50"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8 backdrop-blur-lg bg-slate-900/50 border-b
       border-slate-700 z-50">
              <h2 className="text-2xl font-bold text-white">CollabSpace</h2>
              <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>
            <ul className="space-y-2">
              {links.map((link) => (
                <motion.li
                  key={link.path}
                  whileHover={{ scale: 1.05 }}
                  className="origin-left"
                >
                  <Link
                    to={link.path}
                    className={`flex items-center p-3 rounded-lg transition-all ${
                      location.pathname === link.path
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <i className={`bi ${link.icon} mr-3 text-lg`}></i>
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;