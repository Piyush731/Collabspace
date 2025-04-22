import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Sphere, Box, Torus, TorusKnot, Environment, Text } from "@react-three/drei";
import { FaRocket, FaUser, FaEnvelope, FaLock, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContainer = ({ initialMode = 'login' }) => {
  const [isSignup, setIsSignup] = useState(initialMode === 'signup');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();

  useEffect(() => {
    setIsSignup(location.pathname === '/signup');
  }, [location.pathname]);

  const handleLogin = async (e) => {
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSigningUp(true);
    console.log('Attempting signup with', { username, email, password });
    try {
      setError("");
      const result = await signup(username, email, password);
      console.log('Signup result:', result);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (errMessage) {
      console.error('Signup failed with error:', errMessage);
      setError(errMessage);
      setIsSuccess(false);
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleToggle = (mode) => {
    setIsSignup(mode === 'signup');
    navigate(mode === 'login' ? '/login' : '/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4 text-white
                    w-screen mx-[-20px] mb-[-20px] mt-[-20px] px-[20px] pb-[20px] overflow-x-hidden relative">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Main Container */}
        <div className="glass-effect backdrop-blur-lg border border-slate-700 rounded-2xl p-8 relative overflow-hidden">
          {/* Toggle Buttons */}
          <div className="flex justify-center mb-8 relative z-20">
            <div className="relative w-[200px] h-[40px] glass-effect backdrop-blur-lg border border-slate-700 rounded-xl p-1 flex">
              <motion.div
                className="absolute inset-0 bg-indigo-600 rounded-lg pointer-events-none"
                initial={false}
                animate={{ x: isSignup ? '100%' : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ width: '50%' }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggle('login')}
                className={`relative w-1/2 px-6 py-2 rounded-lg transition-all duration-300 z-10 ${
                  !isSignup ? "text-white" : "text-gray-400"
                }`}
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggle('signup')}
                className={`relative w-1/2 px-6 py-2 rounded-lg transition-all duration-300 z-10 ${
                  isSignup ? "text-white" : "text-gray-400"
                }`}
              >
                Sign Up
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side - 3D Scene */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: isSignup ? "100%" : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`relative h-[500px] ml-[-29px] p-2 mr-[-29px] ${
                  isSignup ? "mt-8" : "mt-0"
                }`}
            >
              <Canvas>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <Environment preset="city" background={false} />
                <RotatingShape signup={isSignup} />
                {/* 3D Text Label */}
                <Text
                  position={[0, -2.5, 0]}
                  fontSize={0.6}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {isSignup ? 'Sign Up' : 'Login'}
                </Text>
                <OrbitControls enableZoom={false} />
              </Canvas>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-2xl"></div>
            </motion.div>

            {/* Right Side - Forms */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: isSignup ? "-100%" : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative glass-effect backdrop-blur-lg border border-slate-700 rounded-2xl p-8"
            >
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>

              <div className="text-center mb-8">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <FaRocket className="text-4xl text-indigo-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {!isSignup ? "Welcome Back to " : "Join "}
                  <span className="animated-gradient-text">CollabSpace</span>
                </h2>
                <p className="text-gray-400">
                  {!isSignup ? "Streamline your team's collaboration" : "Start collaborating with your team today"}
                </p>
              </div>

              {/* Success Message */}
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-center mb-6 p-3 bg-green-900/30 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaCheckCircle className="text-xl" />
                  {!isSignup ? "Login successful! Redirecting..." : "Account created successfully! Redirecting..."}
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

              <form noValidate onSubmit={isSignup ? handleSignup : handleLogin}>
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {isSignup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 invalid:border-slate-700 invalid:ring-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="johndoe"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 invalid:border-slate-700 invalid:ring-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 invalid:border-slate-700 invalid:ring-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isSigningUp}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    {isSigningUp ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8z"></path>
                        </svg>
                        Signing Up...
                      </div>
                    ) : (
                      isSignup ? "Create Account" : "Sign In"
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rotating 3D shape component
const RotatingShape = ({ signup }) => {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.01;
  });
  return signup ? (
    <TorusKnot ref={ref} args={[1.2, 0.4, 128, 32]}>
      <meshStandardMaterial color="#6366f1" metalness={0.5} roughness={0.1} />
    </TorusKnot>
  ) : (
    <Torus ref={ref} args={[1.2, 0.3, 16, 100]}>
      <meshStandardMaterial color="#6366f1" metalness={0.5} roughness={0.1} />
    </Torus>
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

export default AuthContainer; 