import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FolderIcon, LockClosedIcon, GlobeAltIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import API_URL from "../config";


const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token"); 
      if (!token) throw new Error("No token found"); 
      const response = await axios.post(
        `${API_URL}/api/repos`,
        { name, description, visibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Repository created:', response.data);
      navigate("/dashboard"); // Redirect to dashboard after creation
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create repository");
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800
                     w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-effect p-8 rounded-xl shadow-2xl w-full max-w-md backdrop-blur-lg border border-white/10"
    >
      <motion.div 
        className="flex flex-col items-center mb-8"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <FolderIcon className="h-12 w-12 text-blue-500 mb-4 animate-float" />
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Create Repository
        </h2>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-lg border border-red-400/30"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Repository Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 text-slate-200"
              placeholder="my-awesome-repo"
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Visibility
          </label>
          <div className="relative">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 appearance-none"
            >
              <option value="private" className="bg-slate-800">
                <span className="flex items-center">
                  <LockClosedIcon className="w-4 h-4 mr-2" />
                  Private
                </span>
              </option>
              <option value="public" className="bg-slate-800">
                <span className="flex items-center">
                  <GlobeAltIcon className="w-4 h-4 mr-2" />
                  Public
                </span>
              </option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 text-slate-200"
            placeholder="A brief description of your repository..."
            rows="3"
          />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium text-white transition-all relative overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>Creating...</span>
            </div>
          ) : (
            "Create Repository"
          )}
        </motion.button>
      </form>
    </motion.div>

    {/* Background animation elements */}
    <div className="absolute inset-0 -z-10 opacity-20">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-48 h-48 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float 12s infinite ${i * 2}s`,
          }}
        />
      ))}
    </div>
  </div>
);
};

export default CreateRepo;