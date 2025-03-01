// Login.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRocket } from "react-icons/fa";
import { FaCheckCircle } from 'react-icons/fa';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await login(email, password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (errMessage) {
      setError(errMessage);
      setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4 text-white
                      w-screen mx-[-20px] mb-[-20px] mt-[-20px] px-[20px] pb-[20px] overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-effect backdrop-blur-lg border border-slate-700 rounded-2xl w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        
        <div className="text-center mb-8">
          <FaRocket className="text-4xl text-indigo-400 animate-float mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome Back to <span className="animated-gradient-text">CollabSpace</span>
          </h2>
          <p className="text-gray-400">Streamline your team's collaboration</p>
        </div>
           {/* Success Message */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 text-center mb-6 p-3 bg-green-900/30 rounded-lg flex items-center justify-center gap-2"
          >
            <FaCheckCircle className="text-xl" />
            Login successful! Redirecting...
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-center mb-6 p-3 bg-red-900/30 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
            >
              Sign In
            </motion.button>
          </motion.div>

          <p className="text-sm text-gray-400 text-center">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Create account
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

export default Login;