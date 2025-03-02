import React, { useState }from "react";
import { motion } from "framer-motion";
import { FaUserCog, FaSave } from "react-icons/fa"; 
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar";

const SettingsPage = () => { 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);    



  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white
                 w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    > 
      <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')]"></div> 

      <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
        className={`pt-16 transition-all duration-300 ${
          isSidebarOpen ? "pl-64" : "pl-0"
        }`} 
      <div className="max-w-6xl mx-auto pt-10"> 

        <div className="flex items-center gap-2 mb-8">
          <FaUserCog className="text-2xl text-blue-400" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <motion.div
          className="bg-slate-800/50 backdrop-blur-md p-6 rounded-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="space-y-6">
            <div>
              <label className="block mb-2">Notification Preferences</label>
              <select className="w-full bg-slate-700/50 rounded-lg p-2 border border-slate-600">
                <option>Instant</option>
                <option>Daily Digest</option>
                <option>Weekly Summary</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Theme Preference</label>
              <div className="flex gap-4">
                <button className="p-2 rounded-lg bg-slate-700/50 border border-slate-600">
                  Dark
                </button>
                <button className="p-2 rounded-lg bg-slate-700/50 border border-slate-600">
                  Light
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <FaSave /> Save Changes
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;