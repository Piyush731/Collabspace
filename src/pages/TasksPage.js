import React, { useState }from "react";
import { motion } from "framer-motion";
import { FaTasks, FaPlus, FaCheckCircle } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar";

const TasksPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
      const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen); 
  const tasks = []; // Replace with actual data

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
            <FaTasks className="text-blue-400" />
            Tasks
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> New Task
          </motion.button>
        </div>

        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-md p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-gray-400" />
                  <span>{task.title}</span>
                </div>
                <span className="text-sm text-gray-400">{task.dueDate}</span>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              No tasks found
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TasksPage;