import React, { useState }from "react";
import { motion } from "framer-motion";
import { FaChartBar, FaFileDownload } from "react-icons/fa"; 
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar";

const ReportsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
      const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen); 
  const reports = []; // Replace with actual data

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
      
      <div className="max-w-6xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaChartBar className="text-blue-400" />
            Reports
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-md p-6 rounded-lg"
            >
              <h3 className="text-xl font-semibold mb-2">{report.title}</h3>
              <p className="text-gray-400 mb-4">{report.description}</p>
              <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                <FaFileDownload /> Download
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsPage;