import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar";
import RepositoryCard from "../components/RepositoryCard"; 
import API_URL from "../config";

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
        setRepos(reposRes.data);
      } catch (error) {
        console.error("Failed to fetch repositories:", error.message);
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
    <div className="min-h-screen  w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white
                     w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden">
      <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`pt-16 transition-all duration-300 ${
          isSidebarOpen ? "pl-64" : "pl-0"
        }`}
      >
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 shadow-xl mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, {user.username}!
            </h1>
            <p className="text-gray-400">{user.email}</p>
          </motion.div>

          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Repositories</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/create-repo")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
            >
              <i className="bi bi-plus-lg"></i>
              <span>New Repository</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {repoLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="animate-pulse text-gray-500">
                  Loading repositories...
                </div>
              </motion.div>
            ) : repos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                No repositories found
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repos.map((repo, index) => (
                  <motion.div
                    key={repo._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
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
