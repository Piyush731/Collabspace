import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUserCog, FaSave } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";
import toast, { Toaster } from "react-hot-toast";

const SettingsPage = () => {
  const { user } = useAuth();
  const [notificationPreferences, setNotificationPreferences] = useState(user?.notificationPreferences || "Instant");
  const [themePreference, setThemePreference] = useState(user?.themePreference || "Dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${API_URL}/api/auth/settings`,
        { notificationPreferences, themePreference },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Settings updated successfully");
      // Optionally update context user here
    } catch (error) {
      console.error("Failed to update settings", error);
      toast.error("Failed to update settings");
    }
  };

  useEffect(() => {
    // keep local state in sync if user updates elsewhere
    setNotificationPreferences(user?.notificationPreferences || "Instant");
    setThemePreference(user?.themePreference || "Dark");
  }, [user]);

  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white
                 w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')]" />
      <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`pt-16 transition-all duration-300 ${isSidebarOpen ? "pl-64" : "pl-0"}`}>   
        <div className="max-w-6xl mx-auto pt-10">

          <div className="flex items-center gap-2 mb-8">
            <FaUserCog className="text-2xl text-blue-400" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          <motion.div
            className="bg-slate-800/50 backdrop-blur-md p-6 rounded-lg space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div>
              <label className="block mb-2">Notification Preferences</label>
              <select
                className="w-full bg-slate-700/50 rounded-lg p-2 border border-slate-600"
                value={notificationPreferences}
                onChange={e => setNotificationPreferences(e.target.value)}
              >
                <option>Instant</option>
                <option>Daily Digest</option>
                <option>Weekly Summary</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Theme Preference</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setThemePreference("Dark")}
                  className={`p-2 rounded-lg border ${themePreference === "Dark" ? "bg-blue-600 border-blue-500" : "bg-slate-700/50 border-slate-600"}`}>
                  Dark
                </button>
                <button
                  onClick={() => setThemePreference("Light")}
                  className={`p-2 rounded-lg border ${themePreference === "Light" ? "bg-blue-600 border-blue-500" : "bg-slate-700/50 border-slate-600"}`}>
                  Light
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2"
              onClick={handleSave}
            >
              <FaSave /> Save Changes
            </motion.button>
          </motion.div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </motion.div>
  );
};

export default SettingsPage;