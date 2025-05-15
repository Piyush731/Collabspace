import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaGithub } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import loginAnimation from "../assets/login-animation.json";
import signupAnimation from "../assets/signup-animation.json";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const LoginIllustration = () => (
  <Lottie 
    animationData={loginAnimation} 
    loop={true}
    className="h-full w-full"
  />
);

const SignupIllustration = () => (
  <Lottie
    animationData={signupAnimation}
    loop={true}
    className="h-full w-full"
  />
);

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
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (errMessage) {
      setError(errMessage);
      setIsSuccess(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSigningUp(true);
    try {
      setError("");
      await signup(username, email, password);
      setIsSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (errMessage) {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center ml-[-20px] mr-[-20px]
                    mb-[-20px] justify-center p-4 text-white relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <Stars radius={100} depth={50} count={1000} factor={4} />
          <FloatingShapes isSignup={isSignup} />
          <OrbitControls enableZoom={false} enableRotate={false} />
        </Canvas>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="glass-effect backdrop-blur-xl border border-slate-700 rounded-3xl overflow-hidden">
          {/* Toggle Switcher */}
          <div className="flex justify-center my-8">
            <div className="relative w-64 h-12 bg-slate-800 rounded-xl p-1 flex">
              <motion.div
                className="absolute w-1/2 h-full bg-indigo-600 rounded-lg"
                animate={{ x: isSignup ? '100%' : '0%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => handleToggle('login')}
                className="relative w-1/2 flex items-center justify-center text-white z-10"
              >
                Login
              </button>
              <button
                onClick={() => handleToggle('signup')}
                className="relative w-1/2 flex items-center justify-center text-white z-10"
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Animation Side */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignup ? "signup" : "login"}
                initial={{ x: isSignup ? -100 : 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: isSignup ? 100 : -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-[400px] lg:h-[500px]"
              >
                {isSignup ? <SignupIllustration /> : <LoginIllustration />}
              </motion.div>
            </AnimatePresence>

            {/* Form Side */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignup ? "signup-form" : "login-form"}
                initial={{ x: isSignup ? 100 : -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: isSignup ? -100 : 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                    {isSignup ? "Join CollabSpace" : "Welcome Back"}
                  </h1>
                  <p className="text-slate-400">
                    {isSignup ? "Start your collaborative journey today" : "Continue your productive workflow"}
                  </p>
                </div>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 rounded-xl transition-colors"
                  >
                    <FaGoogle className="text-[#4285F4]" />
                    <span>Google</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 rounded-xl transition-colors"
                  >
                    <FaGithub className="text-[#333]" />
                    <span>GitHub</span>
                  </motion.button>
                </div>
                
                {/* Status Messages */}
                <AnimatePresence>
                  {isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-green-400 text-center p-3 bg-green-900/30 rounded-lg"
                    >
                      {isSignup ? "Account created successfully!" : "Login successful!"}
                    </motion.div>
                  )}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-center p-3 bg-red-900/30 rounded-lg"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-slate-700/50" />
                  <span className="px-4 text-slate-500">or continue with</span>
                  <div className="flex-1 border-t border-slate-700/50" />
                </div>

                {/* Form */}
                <form onSubmit={isSignup ? handleSignup : handleLogin}>


                  <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
                    {isSignup && (
                      <div className="relative group">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-indigo-500"
                          placeholder="Username"
                          required
                        />
                      </div>
                    )}

                    <div className="relative group">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        placeholder="Email"
                        required
                      />
                    </div>

                    <div className="relative group">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        placeholder="Password"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isSigningUp}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-300"
                    >
                      {isSigningUp ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8z" />
                          </svg>
                          {isSignup ? "Creating Account..." : "Signing In..."}
                        </div>
                      ) : (
                        isSignup ? "Create Account" : "Sign In"
                      )}
                    </motion.button>
                  </motion.div>
                </form>

                
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const FloatingShapes = ({ isSignup }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.rotation.x = clock.elapsedTime * 0.1;
    ref.current.rotation.y = clock.elapsedTime * 0.2;
    ref.current.position.y = Math.sin(clock.elapsedTime) * 0.5;
  });

  return (
    <mesh ref={ref}>
      {isSignup ? (
        <torusKnotGeometry args={[1.5, 0.5, 256, 64]} />
      ) : (
        <icosahedronGeometry args={[1.8, 1]} />
      )}
      <meshStandardMaterial
        color={isSignup ? "#6366f1" : "#10b981"}
        metalness={0.7}
        roughness={0.3}
        transparent
        opacity={0.2}
      />
    </mesh>
  );
};

export default AuthContainer;