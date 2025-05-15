import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar";
import RepositoryCard from "../components/RepositoryCard"; 
import Notifications from '../pages/notifications';
import API_URL from "../config";
import Lottie from "lottie-react";
import { FiPlus, FiCode, FiUsers, FiLock, FiGlobe } from "react-icons/fi";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repoLoading, setRepoLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) throw new Error("No token found");
        const response = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user data", error.message);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchRepos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const reposRes = await axios.get(`${API_URL}/api/repos/my-repos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRepos(reposRes.data || []);
      } catch (error) {
        console.error("Failed to fetch repositories:", error.message);
        setRepos([]);
      } finally {
        setRepoLoading(false);
      }
    };

    fetchRepos();
  }, [user]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl text-blue-500"
        >
          <i className="bi bi-arrow-repeat"></i>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white
                     w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden">
      <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} notifications={<Notifications />} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`pt-20 transition-all duration-300 ${
          isSidebarOpen ? "pl-72" : "pl-0"
        }`}
      >
        <div className="p-6 md:p-8 w-full max-w-[1920px] mx-auto ">

        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="bg-gradient-to-br from-blue-600/20 to-indigo-600/30 rounded-2xl p-3 md:p-4 backdrop-blur-lg border border-slate-700/50 
     mb-5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 relative overflow-hidden"
>
  {/* Animated background elements */}
  <div className="absolute inset-0 opacity-20">
    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" />
    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
  </div>

  {/* User Info Section */}
  <div className="flex-1 z-10">
    <motion.div 
      className="flex items-center gap-3 md:gap-4"
      initial={{ x: -20 }}
      animate={{ x: 0 }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xl font-bold shadow-lg"
      >
        {user?.username?.[0]?.toUpperCase() || 'U'}
      </motion.div>
      
      <div className="space-y-0.5">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
          Welcome back, {user?.username || 'Developer'}!
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-slate-300">
          <div className="flex items-center gap-1">
            <FiCode className="w-3 h-3" />
            <span className="text-xs md:text-sm">{repos.length} repositories</span>
          </div>
          <span className="hidden md:block text-xs">•</span>
          <span className="text-xs md:text-sm truncate">{user?.email}</span>
        </div>
      </div>
    </motion.div>
  </div>

  {/* Animated Graphic */}
  <motion.div 
    className="hidden md:block w-32 h-32 z-10  mr-20 mt-[-20px]"
    initial={{ scale: 0.8 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 100 }}
  >
    <Lottie 
      animationData={require('../assets/teamwork.json')}
      loop={true}
      style={{ height: '150%',
          width: '155%'
       }}
      rendererSettings={{
        preserveAspectRatio: 'xMidYMid slice',
        className: 'drop-shadow-xl'
      }}
    />
  </motion.div>
</motion.div>

          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Your Workspace</h2>
              <p className="text-slate-400 mt-1">Manage your code repositories</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/create-repo")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 w-full md:w-auto"
            >
              <FiPlus className="text-lg" />
              <span>New Repository</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {repoLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-40 bg-slate-800/50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : !repos || repos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 rounded-xl bg-slate-800/30"
              >
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">📂</div>
                  <h3 className="text-xl font-semibold mb-2">No repositories found</h3>
                  <p className="text-slate-400">Get started by creating a new repository</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repos.map((repo, index) => (
                  <motion.div
                    key={repo._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <RepositoryCard
                      repo={repo}
                      onClick={() => navigate(`/repo/${repo._id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
