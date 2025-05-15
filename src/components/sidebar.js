import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { useAuth } from "../context/AuthContext";

const sidebarVariants = {
  open: { x: 0, opacity: 1 },
  closed: { x: "-100%", opacity: 0 }
};

const linkVariants = {
  hover: { scale: 1.03, originX: 0 },
  tap: { scale: 0.98 }
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user,logout} = useAuth();
  
  // Close sidebar when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest("aside")) {
        toggleSidebar();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, toggleSidebar]);

  // Keyboard shortcuts for navigation
  useHotkeys("1", () => navigate("/dashboard"), [navigate]);
  useHotkeys("2", () => navigate("/repositories"), [navigate]);
  useHotkeys("3", () => navigate("/tasks"), [navigate]);
  useHotkeys("4", () => navigate("/reports"), [navigate]);
  useHotkeys("5", () => navigate("/settings"), [navigate]);
  useHotkeys("esc", toggleSidebar, [toggleSidebar]);

  const links = [
    { path: "/dashboard", icon: "bi-speedometer2", label: "Dashboard", shortcut: "1" },
    { path: "/repositories", icon: "bi-folder", label: "Repositories", shortcut: "2" },
    { path: "/tasks", icon: "bi-list-check", label: "Tasks", shortcut: "3" },
    { path: "/reports", icon: "bi-bar-chart", label: "Reports", shortcut: "4" },
    { path: "/settings", icon: "bi-gear", label: "Settings", shortcut: "5" },
  ];
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // Add a user profile section at the bottom
  // const user = {
  //   name: "John Doe",
  //   email: "john@example.com",
  //   avatar: "https://randomuser.me/api/portraits/men/1.jpg"
  // };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={toggleSidebar}
            />
            
            {/* Sidebar */}
            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-screen w-64 lg:w-72 backdrop-blur-lg bg-slate-900/95 border-r
           border-slate-700 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <i className="bi bi-people-fill mr-2 text-blue-400"></i>
                    CollabSpace
                  </h2>
                  <button
                    onClick={toggleSidebar}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    aria-label="Close sidebar"
                  >
                    <i className="bi bi-x-lg text-xl"></i>
                  </button>
                </div>
                
                <ul className="space-y-2">
                  {links.map((link) => (
                    <motion.li
                      key={link.path}
                      variants={linkVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to={link.path}
                        onClick={toggleSidebar}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          location.pathname.startsWith(link.path)
                            ? "bg-blue-600/90 text-white shadow-lg"
                            : "text-gray-300 hover:bg-gray-800/80"
                        }`}
                      >
                        <div className="flex items-center">
                          <i className={`bi ${link.icon} mr-3 text-lg`}></i>
                          <span className="text-sm font-medium">{link.label}</span>
                        </div>
                        <span className="text-xs bg-gray-700/50 px-2 py-1 rounded">
                          {link.shortcut}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                
                {/* Additional section for workspace switcher */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Workspaces
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center p-2 text-sm rounded-lg text-gray-300 hover:bg-gray-800/50 transition-colors">
                      <i className="bi bi-plus-circle mr-3"></i>
                      Create New Workspace
                    </button>
                  </div>
                </div>
              </div>
              
              {/* User profile section */}
              <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                <div className="flex items-center">
                  <img 
                    src={user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg"} 
                    alt={user?.name || "User"}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user?.username || "Loading..."}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="ml-auto text-gray-400 hover:text-white p-1"
                    title="Logout"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;